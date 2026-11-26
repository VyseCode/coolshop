"use server";

import { revalidatePath } from "next/cache";

import type { FormState } from "@/domain/types";
import { ensureOwnerKey, getExistingOwnerKey } from "@/lib/auth/owner";
import { addItem, getCart, removeItem, setItemQuantity } from "@/lib/services/cart.service";
import { cartItemSchema, readForm } from "@/lib/validators/forms";
import { AppError } from "@/platform/errors";

function refresh() {
  revalidatePath("/", "layout");
}

export async function addToCartAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = cartItemSchema.safeParse(readForm(formData));
  if (!parsed.success || parsed.data.quantity < 1) {
    return { ok: false, error: "Choose a valid quantity." };
  }
  try {
    const ownerKey = await ensureOwnerKey();
    await addItem(ownerKey, parsed.data.productId, parsed.data.quantity);
    refresh();
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Could not add this item." };
  }
}

export async function updateCartAction(formData: FormData) {
  const parsed = cartItemSchema.safeParse(readForm(formData));
  if (!parsed.success) return;
  const ownerKey = await getExistingOwnerKey();
  if (!ownerKey) return;
  try {
    await setItemQuantity(ownerKey, parsed.data.productId, parsed.data.quantity);
    refresh();
  } catch (error) {
    console.error(error);
  }
}

export async function removeCartAction(formData: FormData) {
  const productId = readForm(formData).productId;
  if (!productId) return;
  const ownerKey = await getExistingOwnerKey();
  if (!ownerKey) return;
  await removeItem(ownerKey, productId);
  refresh();
}

export async function readCurrentCart() {
  const ownerKey = await getExistingOwnerKey();
  if (!ownerKey) return null;
  return getCart(ownerKey);
}
