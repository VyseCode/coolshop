import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDb } from "@/lib/db/connect";

export async function GET() {
  try {
    await connectDb();
    await mongoose.connection.db?.command({ ping: 1 });
    return NextResponse.json({ ok: true, service: "coolshop" });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
