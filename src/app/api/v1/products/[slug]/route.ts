import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/http";
import { getProduct, getRelatedProducts } from "@/lib/services/catalog.service";
import { getOftenBoughtWith } from "@/lib/services/discovery.service";
import { getProductReviews } from "@/lib/services/review.service";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const product = await getProduct(slug);
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    const [related, reviews, boughtWith] = await Promise.all([
      getRelatedProducts(product.categorySlug, product.slug),
      getProductReviews(product.id),
      getOftenBoughtWith(product.id),
    ]);
    return NextResponse.json({ product, related, reviews, boughtWith });
  } catch (error) {
    return toErrorResponse(error);
  }
}
