import "server-only";

import { Types } from "mongoose";

import { connectDb } from "@/lib/db/connect";
import { WishlistModel } from "@/lib/db/models/wishlist";
import { isDuplicateKey } from "@/platform/errors";

const WISHLIST_LIMIT = 50;

export async function listWishlistIds(userId: string) {
  await connectDb();
  if (!Types.ObjectId.isValid(userId)) return [];
  const docs = await WishlistModel.find({ userId }).sort({ createdAt: -1 }).limit(WISHLIST_LIMIT).lean();
  return docs.map((doc) => doc.productId.toString());
}

export async function toggleWishlistItem(userId: string, productId: string) {
  await connectDb();
  const existing = await WishlistModel.findOneAndDelete({ userId, productId }).lean();
  if (existing) return false;
  const count = await WishlistModel.countDocuments({ userId });
  if (count >= WISHLIST_LIMIT) return "full" as const;
  try {
    await WishlistModel.create({ userId, productId });
    return true;
  } catch (error) {
    if (isDuplicateKey(error)) return true;
    throw error;
  }
}

export { WISHLIST_LIMIT };
