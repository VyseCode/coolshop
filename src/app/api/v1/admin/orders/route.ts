import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/http";
import { listDeskOrders } from "@/lib/services/order.service";
import { AppError } from "@/platform/errors";

export async function GET(request: Request) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    const orders = await listDeskOrders(session, Number.isFinite(page) ? page : 1);
    return NextResponse.json(orders);
  } catch (error) {
    return toErrorResponse(error);
  }
}
