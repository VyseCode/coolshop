import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRequestSession } from "@/lib/auth/session";
import { readJson, toErrorResponse } from "@/lib/http";
import { listOrders, placeOrder } from "@/lib/services/order.service";
import { checkoutSchema } from "@/lib/validators/forms";
import { AppError } from "@/platform/errors";

export async function GET(request: Request) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    const orders = await listOrders(session.id, Number.isFinite(page) ? page : 1);
    return NextResponse.json(orders);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const parsed = checkoutSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid order details." }, { status: 400 });
    }
    const order = await placeOrder(session, {
      paymentMethod: parsed.data.paymentMethod,
      couponCode: parsed.data.couponCode,
      address: { ...parsed.data, line2: parsed.data.line2 ?? "" },
    });
    revalidatePath("/", "layout");
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
