import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRequestSession } from "@/lib/auth/session";
import { readJson, toErrorResponse } from "@/lib/http";
import { createDeskProduct, listDeskProducts } from "@/lib/services/catalog-admin.service";
import { parseProductWrite, productFormSchema } from "@/lib/validators/forms";
import { AppError } from "@/platform/errors";

export async function GET(request: Request) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const products = await listDeskProducts(session, {
      q: url.searchParams.get("q") ?? "",
      page: Number.isFinite(page) ? page : 1,
    });
    return NextResponse.json(products);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const body = await readJson(request);
    const parsed = productFormSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Check the product fields." }, { status: 400 });
    const featured = typeof body === "object" && body !== null && "featured" in body && Boolean(body.featured);
    const written = parseProductWrite(parsed.data, featured);
    if ("error" in written) return NextResponse.json({ error: written.error }, { status: 400 });
    const product = await createDeskProduct(session, written.value);
    revalidatePath("/");
    revalidatePath("/search");
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
