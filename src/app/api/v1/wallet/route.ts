import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/http";
import { getWallet } from "@/lib/services/wallet.service";
import { AppError } from "@/platform/errors";

export async function GET(request: Request) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const wallet = await getWallet(session.id);
    return NextResponse.json(wallet);
  } catch (error) {
    return toErrorResponse(error);
  }
}
