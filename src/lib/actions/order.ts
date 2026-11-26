"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import type { FormState } from "@/domain/types";
import { getSession } from "@/lib/auth/session";
import { rememberAddress } from "@/lib/services/address.service";
import { cancelOrder, markOrderDelivered, markOrderShipped, placeOrder } from "@/lib/services/order.service";
import { checkoutSchema, fieldErrors, readForm } from "@/lib/validators/forms";
import { AppError } from "@/platform/errors";

export async function placeOrderAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) {
    redirect("/account/login?next=/checkout");
  }
  const parsed = checkoutSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }
  const address = {
    fullName: parsed.data.fullName,
    line1: parsed.data.line1,
    line2: parsed.data.line2 ?? "",
    city: parsed.data.city,
    region: parsed.data.region,
    postalCode: parsed.data.postalCode,
    country: parsed.data.country,
    phone: parsed.data.phone,
  };
  try {
    if (readForm(formData).saveAddress === "on") {
      await rememberAddress(session, address);
    }
    const order = await placeOrder(session, {
      paymentMethod: parsed.data.paymentMethod,
      address,
      couponCode: parsed.data.couponCode,
    });
    revalidatePath("/", "layout");
    redirect(`/orders/${order.id}`);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Could not place the order." };
  }
}

export async function cancelOrderAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in to continue." };
  try {
    const order = await cancelOrder(session, readForm(formData).orderId ?? "");
    revalidatePath("/", "layout");
    revalidatePath(`/orders/${order.id}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Could not cancel the order." };
  }
}

async function moveOrder(formData: FormData, move: "ship" | "deliver"): Promise<FormState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in to continue." };
  try {
    const orderId = readForm(formData).orderId ?? "";
    const order =
      move === "ship" ? await markOrderShipped(session, orderId) : await markOrderDelivered(session, orderId);
    revalidatePath("/", "layout");
    revalidatePath(`/admin/orders/${order.id}`);
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Could not update the order." };
  }
}

export async function shipOrderAction(_prev: FormState, formData: FormData) {
  return moveOrder(formData, "ship");
}

export async function deliverOrderAction(_prev: FormState, formData: FormData) {
  return moveOrder(formData, "deliver");
}
