import "server-only";

import type { SessionUser } from "@/domain/types";
import { findProductsByIds } from "@/lib/repositories/catalog.repository";
import { listWishlistIds, toggleWishlistItem, WISHLIST_LIMIT } from "@/lib/repositories/wishlist.repository";
import { AppError } from "@/platform/errors";

export function getWishlistIds(userId: string) {
  return listWishlistIds(userId);
}

export async function getWishlist(userId: string) {
  const ids = await listWishlistIds(userId);
  const products = await findProductsByIds(ids);
  return ids.flatMap((id) => {
    const product = products.get(id);
    return product ? [product] : [];
  });
}

export async function toggleSavedProduct(user: SessionUser, productId: string) {
  const products = await findProductsByIds([productId]);
  if (!products.has(productId)) throw new AppError("That product is no longer available.", 404, "not_found");
  const saved = await toggleWishlistItem(user.id, productId);
  if (saved === "full") {
    throw new AppError(`You can save up to ${WISHLIST_LIMIT} products.`);
  }
  return saved;
}
