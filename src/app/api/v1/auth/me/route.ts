import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const user = await getRequestSession(request);
  return NextResponse.json({ user });
}
