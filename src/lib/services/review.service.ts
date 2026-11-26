import "server-only";

import type { SessionUser } from "@/domain/types";
import { refreshProductRating } from "@/lib/db/refresh-rating";
import { findProductsByIds } from "@/lib/repositories/catalog.repository";
import { userPurchasedProduct } from "@/lib/repositories/order.repository";
import { findReviewByUser, insertReview, listReviewsForProduct } from "@/lib/repositories/review.repository";
import { AppError, isDuplicateKey } from "@/platform/errors";

export function getProductReviews(productId: string) {
  return listReviewsForProduct(productId);
}

export async function getReviewAccess(user: SessionUser | null, productId: string) {
  if (!user) return { purchased: false, mine: null };
  const [purchased, mine] = await Promise.all([
    userPurchasedProduct(user.id, productId),
    findReviewByUser(productId, user.id),
  ]);
  return { purchased, mine };
}

export async function createReview(
  user: SessionUser,
  input: { productId: string; rating: number; title: string; body: string },
) {
  const products = await findProductsByIds([input.productId]);
  if (!products.has(input.productId)) {
    throw new AppError("That product is no longer available.", 404, "not_found");
  }
  const purchased = await userPurchasedProduct(user.id, input.productId);
  if (!purchased) throw new AppError("Buy this item before reviewing it.");
  try {
    const review = await insertReview({
      productId: input.productId,
      userId: user.id,
      authorName: user.name,
      rating: input.rating,
      title: input.title,
      body: input.body,
    });
    await refreshProductRating(input.productId);
    return review;
  } catch (error) {
    if (isDuplicateKey(error)) {
      throw new AppError("You already reviewed this item.", 409, "already_reviewed");
    }
    throw error;
  }
}
