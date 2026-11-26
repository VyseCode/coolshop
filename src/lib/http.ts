import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";

import { AppError } from "@/platform/errors";

export function toErrorResponse(error: unknown) {
  unstable_rethrow(error);
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
}

export async function readJson(request: Request) {
  return request.json().catch(() => null);
}

export function clientKeyFrom(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}
