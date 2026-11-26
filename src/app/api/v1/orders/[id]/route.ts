import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/http";
import { getOrder } from "@/lib/services/order.service";
import { AppError } from "@/platform/errors";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const { id } = await context.params;
    const order = await getOrder(id, session.id);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    return toErrorResponse(error);
  }
}
