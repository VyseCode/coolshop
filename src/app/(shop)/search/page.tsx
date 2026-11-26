import type { Metadata } from "next";

import { parseCatalogQuery } from "@/domain/catalog-query";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { live } from "@/lib/live";
import { listCategories, searchCatalog } from "@/lib/services/catalog.service";

type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  return { title: q ? `Search: ${q}` : "Shop all" };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await live();
  const params = await searchParams;
  const [categories, result] = await Promise.all([
    listCategories(),
    searchCatalog(parseCatalogQuery(params)),
  ]);
  const q = typeof params.q === "string" ? params.q : "";

  return (
    <CatalogBrowser
      title={q ? `Results for “${q}”` : "Shop all"}
      description={q ? "Matches from the live catalog." : "Every active product, ready to filter."}
      path="/search"
      searchParams={params}
      categories={categories}
      result={result}
    />
  );
}
