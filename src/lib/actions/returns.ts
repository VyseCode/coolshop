"use server";

import { revalidatePath } from "next/cache";

import type { FormState } from "@/domain/types";
import { getSession } from "@/lib/auth/session";
import {
  approveReturn,
  rejectReturn,
  requestReturn,
} from "@/lib/services/return.service";
import { deskCancelOrder } from "@/lib/services/order.service";
import { fieldErrors, readForm, returnDecisionSchema, returnRequestSchema } from "@/lib/validators/forms";
import { AppError } from "@/platform/errors";

function parseReturnItems(formData: FormData) {
  const items: { productId: string; quantity: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string" || !key.startsWith("qty:")) continue;
    const productId = key.slice(4);
    const quantity = Number(value);
    if (!productId || !Number.isInteger(quantity) || quantity <= 0) continue;
    items.push({ productId, quantity });
  }
  return items;
}

export async function requestReturnAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in to continue." };
  const parsed = returnRequestSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please fix the return form.", fieldErrors: fieldErrors(parsed.error) };
  }
  try {
    const entry = await requestReturn(session, parsed.data.orderId, {
      reason: parsed.data.reason,
      items: parseReturnItems(formData),
    });
    revalidatePath("/", "layout");
    revalidatePath(`/orders/${entry.orderId}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Could not submit the return." };
  }
}

export async function approveReturnAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in to continue." };
  const parsed = returnDecisionSchema.safeParse(readForm(formData));
  if (!parsed.success) return { ok: false, error: "Missing return." };
  try {
    const entry = await approveReturn(session, parsed.data.returnId, parsed.data.deskNote ?? "");
    revalidatePath("/", "layout");
    revalidatePath(`/admin/orders/${entry.orderId}`);
    revalidatePath("/admin/returns");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Could not approve the return." };
  }
}

export async function rejectReturnAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in to continue." };
  const parsed = returnDecisionSchema.safeParse(readForm(formData));
  if (!parsed.success) return { ok: false, error: "Missing return." };
  try {
    const entry = await rejectReturn(session, parsed.data.returnId, parsed.data.deskNote ?? "");
    revalidatePath("/", "layout");
    revalidatePath(`/admin/orders/${entry.orderId}`);
    revalidatePath("/admin/returns");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Could not reject the return." };
  }
}

export async function deskCancelOrderAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in to continue." };
  try {
    const order = await deskCancelOrder(session, readForm(formData).orderId ?? "");
    revalidatePath("/", "layout");
    revalidatePath(`/admin/orders/${order.id}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Could not cancel the order." };
  }
}
