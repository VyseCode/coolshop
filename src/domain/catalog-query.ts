export const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
] as const;

export type SortKey = (typeof SORTS)[number]["id"];

export type CatalogQuery = {
  q: string;
  sort: SortKey;
  page: number;
  pageSize: number;
  minPrice?: number;
  maxPrice?: number;
  categorySlug?: string;
};

const SORT_IDS = new Set<string>(SORTS.map((sort) => sort.id));

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function dollarsToCents(value: string | undefined) {
  if (!value?.trim()) return undefined;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return undefined;
  return Math.round(amount * 100);
}

export function parseCatalogQuery(
  input: Record<string, string | string[] | undefined>,
  extras?: { categorySlug?: string; pageSize?: number },
): CatalogQuery {
  const sortValue = first(input.sort) ?? "featured";
  const pageValue = Number(first(input.page) ?? 1);
  const q = (first(input.q) ?? "").replace(/[^\p{L}\p{N}\s-]/gu, " ").trim().slice(0, 80);

  return {
    q,
    sort: SORT_IDS.has(sortValue) ? (sortValue as SortKey) : "featured",
    page: Number.isFinite(pageValue) ? Math.min(100, Math.max(1, Math.floor(pageValue))) : 1,
    pageSize: extras?.pageSize ?? 12,
    minPrice: dollarsToCents(first(input.min)),
    maxPrice: dollarsToCents(first(input.max)),
    categorySlug: extras?.categorySlug,
  };
}

export function catalogHref(
  path: string,
  params: {
    q?: string;
    sort?: string;
    min?: string;
    max?: string;
    page?: number;
  },
) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.sort && params.sort !== "featured") search.set("sort", params.sort);
  if (params.min) search.set("min", params.min);
  if (params.max) search.set("max", params.max);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export function safeNextPath(value: string | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}
