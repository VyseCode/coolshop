import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/http";
import { getDeskDashboard } from "@/lib/services/dashboard.service";
import { AppError } from "@/platform/errors";

export async function GET(request: Request) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const desk = await getDeskDashboard(session);
    return NextResponse.json(desk);
  } catch (error) {
    return toErrorResponse(error);
  }
}
