import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRequestSession } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/http";
import { makeDefaultAddress, removeAddress } from "@/lib/services/address.service";
import { AppError } from "@/platform/errors";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const { id } = await context.params;
    const address = await makeDefaultAddress(session, id);
    revalidatePath("/checkout");
    return NextResponse.json({ address });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const { id } = await context.params;
    await removeAddress(session, id);
    revalidatePath("/checkout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
