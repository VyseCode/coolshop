import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/domain/types";

export const orderStatusLabel: Record<OrderStatus, string> = {
  placed: "Placed",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function paymentLabel(method: PaymentMethod) {
  if (method === "wallet") return "CoolCash";
  if (method === "cod") return "Pay on delivery";
  return "Demo card";
}

export function paymentStatusLabel(status: PaymentStatus) {
  if (status === "captured") return "Paid with CoolCash";
  if (status === "refunded") return "CoolCash returned";
  if (status === "partially_refunded") return "Partially refunded";
  if (status === "demo_authorized") return "Demo card authorized";
  return "Unpaid";
}

export const returnStatusLabel: Record<"requested" | "approved" | "rejected", string> = {
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
};

export function canCancelOrder(status: OrderStatus) {
  return status === "placed" || status === "paid";
}

export function canShipOrder(status: OrderStatus) {
  return status === "placed" || status === "paid";
}

export function canDeliverOrder(status: OrderStatus) {
  return status === "shipped";
}

export function canRequestReturn(status: OrderStatus) {
  return status === "delivered";
}

/**
 * Refund goods + tax for selected lines. Shipping stays with the store on a partial return.
 * A full return of every line also returns shipping.
 */
export function refundForReturnItems(
  order: {
    items: { productId: string; quantity: number; lineTotal: number }[];
    quote: { subtotal: number; discount: number; tax: number; shipping: number; total: number };
  },
  selected: { productId: string; quantity: number }[],
) {
  if (order.quote.subtotal <= 0) return 0;
  let selectedGoods = 0;
  let returningEverything = true;
  for (const line of order.items) {
    const pick = selected.find((item) => item.productId === line.productId);
    const qty = pick?.quantity ?? 0;
    if (qty < 0 || qty > line.quantity) return null;
    if (qty < line.quantity) returningEverything = false;
    if (qty > 0) selectedGoods += Math.round((line.lineTotal / line.quantity) * qty);
  }
  if (selectedGoods <= 0) return null;
  if (returningEverything) return order.quote.total;
  const goodsNet = order.quote.subtotal - order.quote.discount;
  const share = selectedGoods / order.quote.subtotal;
  const refundGoods = Math.round(share * goodsNet);
  const refundTax = Math.round(share * order.quote.tax);
  return Math.min(order.quote.total, refundGoods + refundTax);
}
