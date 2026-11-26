import "server-only";

import { randomBytes } from "node:crypto";

import { canCancelOrder } from "@/domain/orders";
import type { AddressDTO, PaymentMethod, SessionUser } from "@/domain/types";
import { AppError } from "@/platform/errors";
import { clearCart, getCart } from "@/lib/services/cart.service";
import { priceWithCoupon } from "@/lib/services/coupon.service";
import { decrementStock, incrementStock } from "@/lib/repositories/catalog.repository";
import {
  applyOrderRefund,
  findOrderById,
  findOrderForUser,
  insertOrder,
  listAllOrders,
  listOrdersByUser,
  transitionOrder,
} from "@/lib/repositories/order.repository";
import {
  attachLedgerOrder,
  creditWallet,
  debitWallet,
  refundOrderPayment,
} from "@/lib/repositories/wallet.repository";

function orderNumber() {
  return `CS-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function assertAdmin(user: SessionUser) {
  if (user.role !== "admin") throw new AppError("Admin only.", 403, "forbidden");
}

/**
 * Stock is reserved with conditional updates, then rolled back if a later step fails.
 * CoolCash is debited the same way and returned if the order is not saved.
 * A replica set can wrap this in a Mongo transaction without changing the caller.
 */
export async function placeOrder(
  user: SessionUser,
  input: { address: AddressDTO; paymentMethod: PaymentMethod; couponCode?: string },
) {
  const ownerKey = `user:${user.id}`;
  const cart = await getCart(ownerKey);
  if (cart.items.length === 0) throw new AppError("Your bag is empty.");
  const quote = await priceWithCoupon(cart.quote.subtotal, input.couponCode);

  const reserved: { productId: string; quantity: number }[] = [];
  const reference = randomBytes(6).toString("hex");
  let debited = 0;
  let created = false;
  try {
    for (const item of cart.items) {
      const reservedOk = await decrementStock(item.productId, item.quantity);
      if (!reservedOk) {
        throw new AppError(`${item.name} does not have enough stock left.`);
      }
      reserved.push({ productId: item.productId, quantity: item.quantity });
    }

    if (input.paymentMethod === "wallet" && quote.total > 0) {
      await debitWallet(user.id, quote.total, { note: "Checkout", reference });
      debited = quote.total;
    }

    const paid = input.paymentMethod !== "cod";
    const order = await insertOrder({
      orderNumber: orderNumber(),
      userId: user.id,
      email: user.email,
      shippingAddress: input.address,
      items: cart.items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        image: item.image,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),
      quote,
      paymentMethod: input.paymentMethod,
      paymentStatus:
        input.paymentMethod === "wallet"
          ? "captured"
          : input.paymentMethod === "demo_card"
            ? "demo_authorized"
            : "unpaid",
      status: paid ? "paid" : "placed",
    });
    created = true;
    if (debited) await attachLedgerOrder(reference, order.id);
    await clearCart(ownerKey).catch((error) => console.error(error));
    return order;
  } catch (error) {
    if (!created) {
      await Promise.all(reserved.map((line) => incrementStock(line.productId, line.quantity)));
      if (debited) {
        await creditWallet(user.id, debited, { type: "refund", note: "Checkout reversed" }).catch((refundError) =>
          console.error(refundError),
        );
      }
    }
    throw error;
  }
}

async function cancelOpenOrder(orderId: string, ownerId: string) {
  const order = await findOrderById(orderId);
  if (!order) throw new AppError("Order not found.", 404, "not_found");
  if (order.userId !== ownerId) throw new AppError("Order not found.", 404, "not_found");
  if (!canCancelOrder(order.status)) {
    throw new AppError("This order can no longer be cancelled.");
  }
  const refundPayment = order.paymentMethod === "wallet" && order.paymentStatus === "captured";
  const updated = await transitionOrder(
    orderId,
    ["placed", "paid"],
    "cancelled",
    refundPayment || order.paymentMethod === "demo_card" ? "refunded" : undefined,
  );
  if (!updated) throw new AppError("This order can no longer be cancelled.");
  await Promise.all(order.items.map((item) => incrementStock(item.productId, item.quantity)));
  if (refundPayment) {
    await refundOrderPayment(order.userId, order.id, order.quote.total);
  }
  if (order.paymentMethod !== "cod" && order.quote.total > 0) {
    return (await applyOrderRefund(order.id, order.quote.total, "refunded")) ?? updated;
  }
  return updated;
}

export async function cancelOrder(user: SessionUser, orderId: string) {
  const order = await findOrderForUser(orderId, user.id);
  if (!order) throw new AppError("Order not found.", 404, "not_found");
  return cancelOpenOrder(orderId, user.id);
}

export async function deskCancelOrder(user: SessionUser, orderId: string) {
  assertAdmin(user);
  const order = await findOrderById(orderId);
  if (!order) throw new AppError("Order not found.", 404, "not_found");
  return cancelOpenOrder(orderId, order.userId);
}

export async function markOrderShipped(user: SessionUser, orderId: string) {
  assertAdmin(user);
  const updated = await transitionOrder(orderId, ["placed", "paid"], "shipped");
  if (!updated) throw new AppError("Only a placed or paid order can be shipped.");
  return updated;
}

export async function markOrderDelivered(user: SessionUser, orderId: string) {
  assertAdmin(user);
  const updated = await transitionOrder(orderId, ["shipped"], "delivered");
  if (!updated) throw new AppError("Only a shipped order can be marked delivered.");
  return updated;
}

export function listOrders(userId: string, page = 1) {
  return listOrdersByUser(userId, page, 20);
}

export function listDeskOrders(user: SessionUser, page = 1) {
  assertAdmin(user);
  return listAllOrders(page, 30);
}

export function getOrder(orderId: string, userId: string) {
  return findOrderForUser(orderId, userId);
}

export function getDeskOrder(user: SessionUser, orderId: string) {
  assertAdmin(user);
  return findOrderById(orderId);
}
