import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { parseCatalogQuery } from "@/domain/catalog-query";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { live } from "@/lib/live";
import { getCategory, listCategories, searchCatalog } from "@/lib/services/catalog.service";

type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await live();
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Department" };
  return { title: category.name, description: category.description };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  await live();
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  if (!category) notFound();
  const [categories, result] = await Promise.all([
    listCategories(),
    searchCatalog(parseCatalogQuery(query, { categorySlug: slug })),
  ]);

  return (
    <CatalogBrowser
      title={category.name}
      description={category.description}
      path={`/c/${category.slug}`}
      searchParams={query}
      categories={categories}
      activeCategory={category.slug}
      result={result}
    />
  );
}
