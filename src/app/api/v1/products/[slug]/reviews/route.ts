import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRequestSession } from "@/lib/auth/session";
import { readJson, toErrorResponse } from "@/lib/http";
import { getProduct } from "@/lib/services/catalog.service";
import { createReview, getProductReviews } from "@/lib/services/review.service";
import { reviewSchema } from "@/lib/validators/forms";
import { AppError } from "@/platform/errors";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const product = await getProduct(slug);
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    const reviews = await getProductReviews(product.id);
    return NextResponse.json({ reviews });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const { slug } = await context.params;
    const product = await getProduct(slug);
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    const body = await readJson(request);
    const parsed = reviewSchema.safeParse({ ...(body ?? {}), productId: product.id });
    if (!parsed.success) {
      return NextResponse.json({ error: "Check the review and try again." }, { status: 400 });
    }
    const review = await createReview(session, {
      productId: product.id,
      rating: parsed.data.rating,
      title: parsed.data.title ?? "",
      body: parsed.data.body,
    });
    revalidatePath(`/product/${slug}`);
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
