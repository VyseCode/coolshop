"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { safeNextPath } from "@/domain/catalog-query";
import type { FormState } from "@/domain/types";
import { clearGuestCookie, readGuestKey } from "@/lib/auth/owner";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { mergeGuestCart } from "@/lib/services/cart.service";
import { authenticate, registerUser } from "@/lib/services/auth.service";
import { fieldErrors, loginSchema, readForm, registerSchema } from "@/lib/validators/forms";
import { AppError } from "@/platform/errors";

async function rateKey() {
  const headerStore = await headers();
  return headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

async function startSession(user: Awaited<ReturnType<typeof authenticate>>) {
  const guestKey = await readGuestKey();
  await mergeGuestCart(user.id, guestKey);
  await clearGuestCookie();
  await setSessionCookie(user);
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { ok: false, error: "Check your email and password.", fieldErrors: fieldErrors(parsed.error) };
  }
  try {
    const user = await authenticate({ ...parsed.data, rateKey: await rateKey() });
    await startSession(user);
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
  redirect(safeNextPath(readForm(formData).next, "/account"));
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { ok: false, error: "Check the form and try again.", fieldErrors: fieldErrors(parsed.error) };
  }
  try {
    const user = await registerUser({ ...parsed.data, rateKey: await rateKey() });
    await startSession(user);
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
  redirect(safeNextPath(readForm(formData).next, "/account"));
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
