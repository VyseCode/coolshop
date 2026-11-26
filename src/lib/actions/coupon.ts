"use server";

import { revalidatePath } from "next/cache";

import type { FormState, Quote } from "@/domain/types";
import { getSession } from "@/lib/auth/session";
import { getCart } from "@/lib/services/cart.service";
import { createCoupon, priceWithCoupon } from "@/lib/services/coupon.service";
import { couponFormSchema, fieldErrors, readForm } from "@/lib/validators/forms";
import { AppError } from "@/platform/errors";

export async function previewCouponAction(
  code: string,
): Promise<{ ok: true; quote: Quote } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in to continue." };
  try {
    const cart = await getCart(`user:${session.id}`);
    const quote = await priceWithCoupon(cart.quote.subtotal, code);
    return { ok: true, quote };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Could not apply that code." };
  }
}

export async function createCouponAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in to continue." };
  const parsed = couponFormSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { ok: false, error: "Check the coupon.", fieldErrors: fieldErrors(parsed.error) };
  }
  const amount = Number(parsed.data.amount);
  const minSubtotal = parsed.data.minSubtotal ? Math.round(Number(parsed.data.minSubtotal) * 100) : 0;
  const maxUses = parsed.data.maxUses ? Number(parsed.data.maxUses) : null;
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Enter a valid amount." };
  if (!Number.isFinite(minSubtotal) || minSubtotal < 0) return { ok: false, error: "Enter a valid minimum." };
  if (maxUses != null && (!Number.isInteger(maxUses) || maxUses < 1)) {
    return { ok: false, error: "Max uses must be a whole number." };
  }
  try {
    await createCoupon(session, {
      code: parsed.data.code,
      kind: parsed.data.kind,
      amount: parsed.data.kind === "fixed" ? Math.round(amount * 100) : Math.round(amount),
      minSubtotal,
      maxUses,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    });
    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Could not create the coupon." };
  }
}
