import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/http";
import { listCategories } from "@/lib/services/catalog.service";

export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    return toErrorResponse(error);
  }
}
