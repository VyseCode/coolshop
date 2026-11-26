import "server-only";

import { Types } from "mongoose";

import type { ReturnDTO, ReturnItemDTO, ReturnStatus } from "@/domain/types";
import { connectDb } from "@/lib/db/connect";
import { ReturnModel, type ReturnEntity } from "@/lib/db/models/return";

type ReturnRecord = ReturnEntity & { createdAt?: Date };

function toReturn(doc: ReturnRecord): ReturnDTO {
  return {
    id: doc._id.toString(),
    orderId: doc.orderId.toString(),
    orderNumber: doc.orderNumber,
    userId: doc.userId.toString(),
    email: doc.email,
    status: doc.status as ReturnStatus,
    reason: doc.reason,
    items: doc.items.map((item) => ({
      productId: item.productId.toString(),
      slug: item.slug,
      name: item.name,
      image: item.image,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    refundCents: doc.refundCents,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    resolvedAt: doc.resolvedAt ? new Date(doc.resolvedAt).toISOString() : null,
    deskNote: doc.deskNote ?? "",
  };
}

export async function insertReturn(input: {
  orderId: string;
  orderNumber: string;
  userId: string;
  email: string;
  reason: string;
  items: ReturnItemDTO[];
  refundCents: number;
}) {
  await connectDb();
  const doc = await ReturnModel.create({
    orderId: new Types.ObjectId(input.orderId),
    orderNumber: input.orderNumber,
    userId: new Types.ObjectId(input.userId),
    email: input.email,
    reason: input.reason,
    items: input.items.map((item) => ({
      productId: new Types.ObjectId(item.productId),
      slug: item.slug,
      name: item.name,
      image: item.image,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    refundCents: input.refundCents,
    status: "requested",
  });
  const saved = await ReturnModel.findById(doc._id).lean();
  if (!saved) throw new Error("Return was not saved.");
  return toReturn(saved);
}

export async function listReturnsForOrder(orderId: string) {
  await connectDb();
  if (!Types.ObjectId.isValid(orderId)) return [];
  const docs = await ReturnModel.find({ orderId }).sort({ createdAt: -1 }).lean();
  return docs.map((doc) => toReturn(doc));
}

export async function listReturnsByUser(userId: string, page: number, pageSize: number) {
  await connectDb();
  if (!Types.ObjectId.isValid(userId)) {
    return { items: [], total: 0, page, pageSize, totalPages: 1 };
  }
  const filter = { userId: new Types.ObjectId(userId) };
  const [docs, total] = await Promise.all([
    ReturnModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    ReturnModel.countDocuments(filter),
  ]);
  return {
    items: docs.map((doc) => toReturn(doc)),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listDeskReturns(page: number, pageSize: number, status?: ReturnStatus) {
  await connectDb();
  const filter = status ? { status } : {};
  const [docs, total] = await Promise.all([
    ReturnModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    ReturnModel.countDocuments(filter),
  ]);
  return {
    items: docs.map((doc) => toReturn(doc)),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function findReturnById(returnId: string) {
  await connectDb();
  if (!Types.ObjectId.isValid(returnId)) return null;
  const doc = await ReturnModel.findById(returnId).lean();
  return doc ? toReturn(doc) : null;
}

export async function transitionReturn(
  returnId: string,
  from: ReturnStatus[],
  to: ReturnStatus,
  deskNote?: string,
) {
  await connectDb();
  if (!Types.ObjectId.isValid(returnId)) return null;
  const doc = await ReturnModel.findOneAndUpdate(
    { _id: returnId, status: { $in: from } },
    {
      $set: {
        status: to,
        deskNote: deskNote ?? "",
        resolvedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  ).lean();
  return doc ? toReturn(doc) : null;
}

export async function countOpenReturns() {
  await connectDb();
  return ReturnModel.countDocuments({ status: "requested" });
}
