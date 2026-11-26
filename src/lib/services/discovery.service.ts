import "server-only";

import { findProductsByIds } from "@/lib/repositories/catalog.repository";
import { coPurchasedProductIds } from "@/lib/repositories/order.repository";

export async function getOftenBoughtWith(productId: string) {
  const ids = await coPurchasedProductIds(productId, 4);
  const products = await findProductsByIds(ids);
  return ids.flatMap((id) => {
    const product = products.get(id);
    return product ? [product] : [];
  });
}
