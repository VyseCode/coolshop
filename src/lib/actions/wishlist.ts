"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth/session";
import { toggleSavedProduct } from "@/lib/services/wishlist.service";
import { AppError } from "@/platform/errors";

export async function toggleWishlistAction(productId: string) {
  const session = await getSession();
  if (!session) return { ok: false as const, saved: false, error: "Sign in to save products." };
  try {
    const saved = await toggleSavedProduct(session, productId);
    revalidatePath("/", "layout");
    revalidatePath("/wishlist");
    revalidatePath("/account");
    return { ok: true as const, saved };
  } catch (error) {
    if (error instanceof AppError) return { ok: false as const, saved: false, error: error.message };
    console.error(error);
    return { ok: false as const, saved: false, error: "Could not update your wishlist." };
  }
}
