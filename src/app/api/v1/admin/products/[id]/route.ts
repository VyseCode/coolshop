import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRequestSession } from "@/lib/auth/session";
import { readJson, toErrorResponse } from "@/lib/http";
import { getDeskProduct, updateDeskProduct } from "@/lib/services/catalog-admin.service";
import { parseProductWrite, productFormSchema } from "@/lib/validators/forms";
import { AppError } from "@/platform/errors";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const { id } = await context.params;
    const product = await getDeskProduct(session, id);
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const body = await readJson(request);
    const parsed = productFormSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Check the product fields." }, { status: 400 });
    const featured = typeof body === "object" && body !== null && "featured" in body && Boolean(body.featured);
    const written = parseProductWrite(parsed.data, featured);
    if ("error" in written) return NextResponse.json({ error: written.error }, { status: 400 });
    const { id } = await context.params;
    const product = await updateDeskProduct(session, id, written.value);
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath(`/product/${product.slug}`);
    return NextResponse.json({ product });
  } catch (error) {
    return toErrorResponse(error);
  }
}
