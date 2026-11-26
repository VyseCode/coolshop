"use server";

import { revalidatePath } from "next/cache";

import type { FormState } from "@/domain/types";
import { getSession } from "@/lib/auth/session";
import { findProductsByIds } from "@/lib/repositories/catalog.repository";
import { createReview } from "@/lib/services/review.service";
import { fieldErrors, readForm, reviewSchema } from "@/lib/validators/forms";
import { AppError } from "@/platform/errors";

export async function createReviewAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in to review this item." };
  const parsed = reviewSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { ok: false, error: "Check the review and try again.", fieldErrors: fieldErrors(parsed.error) };
  }
  try {
    await createReview(session, {
      productId: parsed.data.productId,
      rating: parsed.data.rating,
      title: parsed.data.title ?? "",
      body: parsed.data.body,
    });
    const products = await findProductsByIds([parsed.data.productId]);
    const slug = products.get(parsed.data.productId)?.slug;
    if (slug) revalidatePath(`/product/${slug}`);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Could not save the review." };
  }
}
