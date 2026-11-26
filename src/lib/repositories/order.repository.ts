import "server-only";

import { Types } from "mongoose";

import type { AddressDTO, OrderDTO, OrderStatus, PaymentMethod, PaymentStatus, Quote } from "@/domain/types";
import { connectDb } from "@/lib/db/connect";
import { OrderModel, type OrderEntity } from "@/lib/db/models/order";

type OrderRecord = OrderEntity & { createdAt?: Date };

function toOrder(doc: OrderRecord): OrderDTO {
  const items = doc.items.map((item) => ({
    productId: item.productId.toString(),
    slug: item.slug,
    name: item.name,
    image: item.image,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.unitPrice * item.quantity,
  }));
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    orderNumber: doc.orderNumber,
    email: doc.email,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    status: doc.status as OrderStatus,
    paymentMethod: doc.paymentMethod as PaymentMethod,
    paymentStatus: doc.paymentStatus as PaymentStatus,
    shippingAddress: {
      fullName: doc.shippingAddress.fullName,
      line1: doc.shippingAddress.line1,
      line2: doc.shippingAddress.line2 ?? "",
      city: doc.shippingAddress.city,
      region: doc.shippingAddress.region,
      postalCode: doc.shippingAddress.postalCode,
      country: doc.shippingAddress.country,
      phone: doc.shippingAddress.phone,
    },
    items,
    quote: {
      subtotal: doc.subtotal,
      discount: doc.discount ?? 0,
      couponCode: doc.couponCode || null,
      shipping: doc.shipping,
      tax: doc.tax,
      total: doc.total,
    },
    refundedCents: doc.refundedCents ?? 0,
  };
}

export async function insertOrder(input: {
  orderNumber: string;
  userId: string;
  email: string;
  shippingAddress: AddressDTO;
  items: OrderDTO["items"];
  quote: Quote;
  paymentMethod: PaymentMethod;
  paymentStatus: OrderDTO["paymentStatus"];
  status: OrderStatus;
}) {
  await connectDb();
  const doc = await OrderModel.create({
    orderNumber: input.orderNumber,
    userId: new Types.ObjectId(input.userId),
    email: input.email,
    shippingAddress: input.shippingAddress,
    items: input.items.map((item) => ({
      productId: new Types.ObjectId(item.productId),
      slug: item.slug,
      name: item.name,
      image: item.image,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    })),
    subtotal: input.quote.subtotal,
    discount: input.quote.discount,
    couponCode: input.quote.couponCode ?? "",
    shipping: input.quote.shipping,
    tax: input.quote.tax,
    total: input.quote.total,
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentStatus,
    refundedCents: 0,
    status: input.status,
  });
  const saved = await OrderModel.findById(doc._id).lean();
  if (!saved) throw new Error("Order was not saved.");
  return toOrder(saved);
}

export async function listOrdersByUser(userId: string, page: number, pageSize: number) {
  await connectDb();
  if (!Types.ObjectId.isValid(userId)) {
    return { items: [], total: 0, page, pageSize, totalPages: 1 };
  }
  const filter = { userId: new Types.ObjectId(userId) };
  const [docs, total] = await Promise.all([
    OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    OrderModel.countDocuments(filter),
  ]);
  return {
    items: docs.map((doc) => toOrder(doc)),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function findOrderForUser(orderId: string, userId: string) {
  await connectDb();
  if (!Types.ObjectId.isValid(orderId) || !Types.ObjectId.isValid(userId)) return null;
  const doc = await OrderModel.findOne({
    _id: orderId,
    userId: new Types.ObjectId(userId),
  }).lean();
  return doc ? toOrder(doc) : null;
}

export async function listAllOrders(page: number, pageSize: number) {
  await connectDb();
  const [docs, total] = await Promise.all([
    OrderModel.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    OrderModel.countDocuments(),
  ]);
  return {
    items: docs.map((doc) => toOrder(doc)),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function findOrderById(orderId: string) {
  await connectDb();
  if (!Types.ObjectId.isValid(orderId)) return null;
  const doc = await OrderModel.findById(orderId).lean();
  return doc ? toOrder(doc) : null;
}

export async function transitionOrder(
  orderId: string,
  from: OrderStatus[],
  to: OrderStatus,
  paymentStatus?: PaymentStatus,
) {
  await connectDb();
  if (!Types.ObjectId.isValid(orderId)) return null;
  const update: { status: OrderStatus; paymentStatus?: PaymentStatus; refundedCents?: number } = { status: to };
  if (paymentStatus) update.paymentStatus = paymentStatus;
  const doc = await OrderModel.findOneAndUpdate(
    { _id: orderId, status: { $in: from } },
    { $set: update },
    { returnDocument: "after" },
  ).lean();
  return doc ? toOrder(doc) : null;
}

export async function applyOrderRefund(
  orderId: string,
  amountCents: number,
  paymentStatus: PaymentStatus,
) {
  await connectDb();
  if (!Types.ObjectId.isValid(orderId) || amountCents < 0) return null;
  const doc = await OrderModel.findByIdAndUpdate(
    orderId,
    { $inc: { refundedCents: amountCents }, $set: { paymentStatus } },
    { returnDocument: "after" },
  ).lean();
  return doc ? toOrder(doc) : null;
}

export async function aggregateSalesStats() {
  await connectDb();
  const [totals, openOrders, couponRows] = await Promise.all([
    OrderModel.aggregate<{ revenueCents: number; refundedCents: number; orderCount: number }>([
      { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
      {
        $group: {
          _id: null,
          revenueCents: { $sum: "$total" },
          refundedCents: { $sum: "$refundedCents" },
          orderCount: { $sum: 1 },
        },
      },
    ]),
    OrderModel.countDocuments({ status: { $in: ["placed", "paid", "shipped"] } }),
    OrderModel.aggregate<{ _id: string; uses: number; discountCents: number }>([
      { $match: { couponCode: { $nin: [null, ""] }, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$couponCode",
          uses: { $sum: 1 },
          discountCents: { $sum: "$discount" },
        },
      },
      { $sort: { uses: -1 } },
      { $limit: 8 },
    ]),
  ]);
  const row = totals[0];
  return {
    revenueCents: (row?.revenueCents ?? 0) - (row?.refundedCents ?? 0),
    grossCents: row?.revenueCents ?? 0,
    refundedCents: row?.refundedCents ?? 0,
    paidOrderCount: row?.orderCount ?? 0,
    openOrders,
    coupons: couponRows.map((coupon) => ({
      code: coupon._id,
      uses: coupon.uses,
      discountCents: coupon.discountCents ?? 0,
    })),
  };
}

export async function coPurchasedProductIds(productId: string, limit = 4) {
  await connectDb();
  if (!Types.ObjectId.isValid(productId)) return [];
  const id = new Types.ObjectId(productId);
  const rows = await OrderModel.aggregate<{ _id: Types.ObjectId }>([
    { $match: { status: { $ne: "cancelled" }, "items.productId": id } },
    { $unwind: "$items" },
    { $match: { "items.productId": { $ne: id } } },
    { $group: { _id: "$items.productId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
  return rows.map((row) => row._id.toString());
}

export async function userPurchasedProduct(userId: string, productId: string) {
  await connectDb();
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) return false;
  const found = await OrderModel.exists({
    userId: new Types.ObjectId(userId),
    status: { $ne: "cancelled" },
    "items.productId": new Types.ObjectId(productId),
  });
  return Boolean(found);
}
