import "server-only";

import { cache } from "react";

import type { CatalogQuery } from "@/domain/catalog-query";
import * as catalog from "@/lib/repositories/catalog.repository";

export const listCategories = cache(() => catalog.listCategories());

export const getCategory = cache((slug: string) => catalog.findCategoryBySlug(slug));

export const getProduct = cache((slug: string) => catalog.findProductBySlug(slug));

export const searchCatalog = cache((query: CatalogQuery) => catalog.searchProducts(query));

export const getHomeCatalog = cache(async () => {
  const [departments, featured, newest, total] = await Promise.all([
    catalog.listDepartments(),
    catalog.findFeatured(8),
    catalog.findNewest(4),
    catalog.countActiveProducts(),
  ]);
  return { departments, featured, newest, total };
});

export function getRelatedProducts(categorySlug: string, slug: string) {
  return catalog.findRelated(categorySlug, slug, 4);
}
