import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRequestSession } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/http";
import { cancelOrder } from "@/lib/services/order.service";
import { AppError } from "@/platform/errors";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const { id } = await context.params;
    const order = await cancelOrder(session, id);
    revalidatePath("/", "layout");
    return NextResponse.json({ order });
  } catch (error) {
    return toErrorResponse(error);
  }
}
