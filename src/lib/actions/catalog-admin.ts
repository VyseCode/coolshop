"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import type { FormState } from "@/domain/types";
import { getSession } from "@/lib/auth/session";
import type { ProductWrite } from "@/lib/repositories/catalog.repository";
import { createDeskProduct, updateDeskProduct } from "@/lib/services/catalog-admin.service";
import { fieldErrors, parseProductWrite, productFormSchema, readForm } from "@/lib/validators/forms";
import { AppError } from "@/platform/errors";

function readProduct(formData: FormData): { ok: true; value: ProductWrite } | { ok: false; error: string; fieldErrors?: Record<string, string> } {
  const data = readForm(formData);
  const parsed = productFormSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "Check the product fields.", fieldErrors: fieldErrors(parsed.error) };
  }
  const written = parseProductWrite(parsed.data, data.featured === "on");
  if ("error" in written) {
    const message = written.error ?? "Check the product fields.";
    return { ok: false, error: message, fieldErrors: { [String(written.field ?? "form")]: message } };
  }
  return { ok: true, value: written.value };
}

function refreshCatalog(slug: string, categorySlug: string) {
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath(`/product/${slug}`);
  revalidatePath(`/c/${categorySlug}`);
  revalidatePath("/admin/products");
}

export async function createProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in to continue." };
  const parsed = readProduct(formData);
  if (!parsed.ok) return { ok: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  try {
    const product = await createDeskProduct(session, parsed.value);
    refreshCatalog(product.slug, product.categorySlug);
    redirect(`/admin/products/${product.id}`);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Could not save the product." };
  }
}

export async function updateProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in to continue." };
  const parsed = readProduct(formData);
  if (!parsed.ok) return { ok: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  try {
    const product = await updateDeskProduct(session, readForm(formData).productId ?? "", parsed.value);
    refreshCatalog(product.slug, product.categorySlug);
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Could not save the product." };
  }
}
