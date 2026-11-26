import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { ensureOwnerKey, getExistingOwnerKey } from "@/lib/auth/owner";
import { readJson, toErrorResponse } from "@/lib/http";
import { addItem, emptyCart, getCart, removeItem, setItemQuantity } from "@/lib/services/cart.service";
import { cartItemSchema } from "@/lib/validators/forms";

async function currentCart() {
  const ownerKey = await getExistingOwnerKey();
  if (!ownerKey) return emptyCart();
  return getCart(ownerKey);
}

export async function GET() {
  try {
    return NextResponse.json(await currentCart());
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const parsed = cartItemSchema.safeParse(await readJson(request));
    if (!parsed.success || parsed.data.quantity < 1) {
      return NextResponse.json({ error: "Send a productId and quantity." }, { status: 400 });
    }
    const cart = await addItem(await ensureOwnerKey(), parsed.data.productId, parsed.data.quantity);
    revalidatePath("/", "layout");
    return NextResponse.json(cart);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const parsed = cartItemSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Send a productId and quantity." }, { status: 400 });
    }
    const ownerKey = await getExistingOwnerKey();
    if (!ownerKey) return NextResponse.json(emptyCart());
    const cart = await setItemQuantity(ownerKey, parsed.data.productId, parsed.data.quantity);
    revalidatePath("/", "layout");
    return NextResponse.json(cart);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const productId = new URL(request.url).searchParams.get("productId");
    if (!productId) return NextResponse.json({ error: "Missing productId." }, { status: 400 });
    const ownerKey = await getExistingOwnerKey();
    if (!ownerKey) return NextResponse.json(emptyCart());
    const cart = await removeItem(ownerKey, productId);
    revalidatePath("/", "layout");
    return NextResponse.json(cart);
  } catch (error) {
    return toErrorResponse(error);
  }
}
