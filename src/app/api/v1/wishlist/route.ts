import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRequestSession } from "@/lib/auth/session";
import { readJson, toErrorResponse } from "@/lib/http";
import { getWishlist, toggleSavedProduct } from "@/lib/services/wishlist.service";
import { AppError } from "@/platform/errors";

export async function GET(request: Request) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const products = await getWishlist(session.id);
    return NextResponse.json({ products });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const body = await readJson(request);
    const productId = typeof body === "object" && body && "productId" in body ? String(body.productId) : "";
    if (!productId) return NextResponse.json({ error: "Send a productId." }, { status: 400 });
    const saved = await toggleSavedProduct(session, productId);
    revalidatePath("/", "layout");
    return NextResponse.json({ saved });
  } catch (error) {
    return toErrorResponse(error);
  }
}
