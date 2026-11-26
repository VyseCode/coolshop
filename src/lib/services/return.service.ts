import "server-only";

import { canRequestReturn, refundForReturnItems } from "@/domain/orders";
import type { OrderDTO, ReturnItemDTO, SessionUser } from "@/domain/types";
import { AppError } from "@/platform/errors";
import { incrementStock } from "@/lib/repositories/catalog.repository";
import { applyOrderRefund, findOrderById, findOrderForUser } from "@/lib/repositories/order.repository";
import {
  countOpenReturns,
  findReturnById,
  insertReturn,
  listDeskReturns,
  listReturnsForOrder,
  transitionReturn,
} from "@/lib/repositories/return.repository";
import { refundOrderPayment } from "@/lib/repositories/wallet.repository";

function assertAdmin(user: SessionUser) {
  if (user.role !== "admin") throw new AppError("Admin only.", 403, "forbidden");
}

export function remainingReturnable(order: OrderDTO, returns: { status: string; items: ReturnItemDTO[] }[]) {
  const consumed = new Map<string, number>();
  for (const entry of returns) {
    if (entry.status === "rejected") continue;
    for (const item of entry.items) {
      consumed.set(item.productId, (consumed.get(item.productId) ?? 0) + item.quantity);
    }
  }
  return order.items.map((item) => ({
    ...item,
    returnable: Math.max(0, item.quantity - (consumed.get(item.productId) ?? 0)),
  }));
}

export async function getOrderWithReturns(orderId: string, userId: string) {
  const order = await findOrderForUser(orderId, userId);
  if (!order) return null;
  const returns = await listReturnsForOrder(orderId);
  return { ...order, returns };
}

export async function getDeskOrderWithReturns(user: SessionUser, orderId: string) {
  assertAdmin(user);
  const order = await findOrderById(orderId);
  if (!order) return null;
  const returns = await listReturnsForOrder(orderId);
  return { ...order, returns };
}

export async function requestReturn(
  user: SessionUser,
  orderId: string,
  input: { reason: string; items: { productId: string; quantity: number }[] },
) {
  const reason = input.reason.trim();
  if (reason.length < 8) throw new AppError("Tell us a bit more about the return.");
  if (reason.length > 400) throw new AppError("Keep the reason under 400 characters.");

  const order = await findOrderForUser(orderId, user.id);
  if (!order) throw new AppError("Order not found.", 404, "not_found");
  if (!canRequestReturn(order.status)) {
    throw new AppError("Returns are only available after delivery.");
  }

  const existing = await listReturnsForOrder(orderId);
  const returnable = remainingReturnable(order, existing);
  const selected = input.items.filter((item) => item.quantity > 0);
  if (selected.length === 0) throw new AppError("Choose at least one item to return.");

  const returnItems: ReturnItemDTO[] = [];
  for (const pick of selected) {
    const line = returnable.find((item) => item.productId === pick.productId);
    if (!line || pick.quantity > line.returnable) {
      throw new AppError("One of those quantities is no longer returnable.");
    }
    returnItems.push({
      productId: line.productId,
      slug: line.slug,
      name: line.name,
      image: line.image,
      unitPrice: line.unitPrice,
      quantity: pick.quantity,
      lineTotal: Math.round((line.lineTotal / line.quantity) * pick.quantity),
    });
  }

  const refundCents = refundForReturnItems(order, selected);
  if (refundCents === null || refundCents <= 0) {
    throw new AppError("Could not price that return.");
  }

  return insertReturn({
    orderId: order.id,
    orderNumber: order.orderNumber,
    userId: user.id,
    email: order.email,
    reason,
    items: returnItems,
    refundCents,
  });
}

export async function approveReturn(user: SessionUser, returnId: string, deskNote = "") {
  assertAdmin(user);
  const current = await findReturnById(returnId);
  if (!current) throw new AppError("Return not found.", 404, "not_found");
  if (current.status !== "requested") throw new AppError("This return was already resolved.");

  const order = await findOrderById(current.orderId);
  if (!order) throw new AppError("Order not found.", 404, "not_found");

  const updated = await transitionReturn(returnId, ["requested"], "approved", deskNote.trim().slice(0, 240));
  if (!updated) throw new AppError("This return was already resolved.");

  await Promise.all(updated.items.map((item) => incrementStock(item.productId, item.quantity)));

  if (
    order.paymentMethod === "wallet" &&
    (order.paymentStatus === "captured" || order.paymentStatus === "partially_refunded") &&
    updated.refundCents > 0
  ) {
    await refundOrderPayment(order.userId, order.id, updated.refundCents, {
      note: "Return approved",
      reference: `return:${updated.id}`,
    });
  }

  if (order.paymentMethod !== "cod" && updated.refundCents > 0) {
    const nextRefunded = order.refundedCents + updated.refundCents;
    const paymentStatus = nextRefunded >= order.quote.total ? "refunded" : "partially_refunded";
    await applyOrderRefund(order.id, updated.refundCents, paymentStatus);
  }

  return updated;
}

export async function rejectReturn(user: SessionUser, returnId: string, deskNote = "") {
  assertAdmin(user);
  const updated = await transitionReturn(returnId, ["requested"], "rejected", deskNote.trim().slice(0, 240));
  if (!updated) throw new AppError("This return was already resolved.");
  return updated;
}

export function listOpenDeskReturns(user: SessionUser, page = 1) {
  assertAdmin(user);
  return listDeskReturns(page, 30, "requested");
}

export function listAllDeskReturns(user: SessionUser, page = 1) {
  assertAdmin(user);
  return listDeskReturns(page, 30);
}

export function openReturnCount() {
  return countOpenReturns();
}
