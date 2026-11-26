import "server-only";

import { Types } from "mongoose";

import type { ReviewDTO } from "@/domain/types";
import { connectDb } from "@/lib/db/connect";
import { ReviewModel, type ReviewEntity } from "@/lib/db/models/review";

function toReview(doc: ReviewEntity & { createdAt?: Date }): ReviewDTO {
  return {
    id: doc._id.toString(),
    productId: doc.productId.toString(),
    userId: doc.userId.toString(),
    authorName: doc.authorName,
    rating: doc.rating,
    title: doc.title ?? "",
    body: doc.body,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
  };
}

export async function listReviewsForProduct(productId: string) {
  await connectDb();
  if (!Types.ObjectId.isValid(productId)) return [];
  const docs = await ReviewModel.find({ productId }).sort({ createdAt: -1 }).limit(20).lean();
  return docs.map((doc) => toReview(doc));
}

export async function findReviewByUser(productId: string, userId: string) {
  await connectDb();
  if (!Types.ObjectId.isValid(productId) || !Types.ObjectId.isValid(userId)) return null;
  const doc = await ReviewModel.findOne({ productId, userId }).lean();
  return doc ? toReview(doc) : null;
}

export async function insertReview(input: {
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
}) {
  await connectDb();
  const doc = await ReviewModel.create({
    productId: new Types.ObjectId(input.productId),
    userId: new Types.ObjectId(input.userId),
    authorName: input.authorName,
    rating: input.rating,
    title: input.title,
    body: input.body,
  });
  const saved = await ReviewModel.findById(doc._id).lean();
  if (!saved) throw new Error("Review was not saved.");
  return toReview(saved);
}
