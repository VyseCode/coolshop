import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/http";
import { listAllDeskReturns } from "@/lib/services/return.service";
import { AppError } from "@/platform/errors";

export async function GET(request: Request) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const returns = await listAllDeskReturns(session);
    return NextResponse.json(returns);
  } catch (error) {
    return toErrorResponse(error);
  }
}
