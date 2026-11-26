import { NextResponse } from "next/server";

import { parseCatalogQuery } from "@/domain/catalog-query";
import { toErrorResponse } from "@/lib/http";
import { searchCatalog } from "@/lib/services/catalog.service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const input = Object.fromEntries(url.searchParams.entries());
    const result = await searchCatalog(
      parseCatalogQuery(input, { categorySlug: input.category || undefined }),
    );
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
