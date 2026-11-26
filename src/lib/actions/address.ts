"use server";

import { revalidatePath } from "next/cache";

import type { FormState } from "@/domain/types";
import { getSession } from "@/lib/auth/session";
import { makeDefaultAddress, rememberAddress, removeAddress } from "@/lib/services/address.service";
import { addressSchema, fieldErrors, readForm } from "@/lib/validators/forms";
import { AppError } from "@/platform/errors";

function requireSession() {
  return getSession();
}

export async function saveAddressAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();
  if (!session) return { ok: false, error: "Sign in to continue." };
  const parsed = addressSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { ok: false, error: "Check the address.", fieldErrors: fieldErrors(parsed.error) };
  }
  try {
    await rememberAddress(session, {
      ...parsed.data,
      line2: parsed.data.line2 ?? "",
      label: readForm(formData).label ?? "",
    });
    revalidatePath("/account");
    revalidatePath("/checkout");
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Could not save the address." };
  }
}

export async function defaultAddressAction(formData: FormData) {
  const session = await getSession();
  if (!session) return;
  try {
    await makeDefaultAddress(session, readForm(formData).addressId ?? "");
    revalidatePath("/account");
    revalidatePath("/checkout");
  } catch (error) {
    if (!(error instanceof AppError)) console.error(error);
  }
}

export async function deleteAddressAction(formData: FormData) {
  const session = await getSession();
  if (!session) return;
  try {
    await removeAddress(session, readForm(formData).addressId ?? "");
    revalidatePath("/account");
    revalidatePath("/checkout");
  } catch (error) {
    if (!(error instanceof AppError)) console.error(error);
  }
}
