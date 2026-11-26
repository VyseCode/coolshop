"use server";

import { findProductBySlug } from "@/lib/repositories/catalog.repository";
import { rememberRecentSlug } from "@/lib/recent";

export async function recordRecentView(slug: string) {
  const product = await findProductBySlug(slug);
  if (!product) return;
  await rememberRecentSlug(product.slug);
}
