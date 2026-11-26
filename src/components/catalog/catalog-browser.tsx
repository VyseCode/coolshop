import Link from "next/link";

import { catalogHref, SORTS, type SortKey } from "@/domain/catalog-query";
import type { CategoryDTO, PageResult, ProductCardDTO } from "@/domain/types";
import { ProductGrid } from "@/components/product/product-card";
import { inputClass, secondaryButtonClass } from "@/components/ui/classes";

function one(search: Record<string, string | string[] | undefined>, key: string) {
  const value = search[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function CatalogBrowser({
  title,
  description,
  path,
  searchParams,
  categories,
  activeCategory,
  result,
}: {
  title: string;
  description?: string;
  path: string;
  searchParams: Record<string, string | string[] | undefined>;
  categories: CategoryDTO[];
  activeCategory?: string;
  result: PageResult<ProductCardDTO>;
}) {
  const q = one(searchParams, "q");
  const min = one(searchParams, "min");
  const max = one(searchParams, "max");
  const sort = (one(searchParams, "sort") || "featured") as SortKey;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">{title}</h1>
        {description ? <p className="mt-3 text-muted">{description}</p> : null}
        <p className="mt-2 text-sm text-muted">
          {result.total} {result.total === 1 ? "product" : "products"}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-8">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Department</h2>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <Link
                  href={catalogHref("/search", { q, min, max, sort })}
                  className={`block rounded-xl px-3 py-2 ${!activeCategory ? "bg-mint font-medium text-forest" : "hover:bg-white"}`}
                >
                  All departments
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={catalogHref(`/c/${category.slug}`, { q, min, max, sort })}
                    className={`block rounded-xl px-3 py-2 ${
                      activeCategory === category.slug ? "bg-mint font-medium text-forest" : "hover:bg-white"
                    }`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <form action={path} method="get" className="space-y-3">
            {q ? <input type="hidden" name="q" value={q} /> : null}
            {sort !== "featured" ? <input type="hidden" name="sort" value={sort} /> : null}
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Price</h2>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputClass} name="min" inputMode="decimal" placeholder="Min" defaultValue={min} aria-label="Minimum price" />
              <input className={inputClass} name="max" inputMode="decimal" placeholder="Max" defaultValue={max} aria-label="Maximum price" />
            </div>
            <button className={secondaryButtonClass} type="submit">
              Apply
            </button>
          </form>
        </aside>

        <section>
          <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
            {SORTS.map((option) => (
              <Link
                key={option.id}
                href={catalogHref(path, { q, min, max, sort: option.id })}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
                  sort === option.id ? "bg-forest text-white" : "border border-line bg-white hover:border-forest/30"
                }`}
                aria-current={sort === option.id ? "true" : undefined}
              >
                {option.label}
              </Link>
            ))}
          </div>

          {result.items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line bg-card px-6 py-16 text-center">
              <h2 className="font-display text-3xl">No matches</h2>
              <p className="mt-2 text-muted">Try another search, or clear the price filter.</p>
              <Link href="/search" className={`${secondaryButtonClass} mt-6`}>
                Browse everything
              </Link>
            </div>
          ) : (
            <ProductGrid products={result.items} />
          )}

          {result.totalPages > 1 ? (
            <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center gap-2">
              {Array.from({ length: result.totalPages }, (_, index) => index + 1).map((page) => (
                <Link
                  key={page}
                  href={catalogHref(path, { q, min, max, sort, page })}
                  aria-current={page === result.page ? "page" : undefined}
                  className={`grid size-10 place-items-center rounded-full text-sm ${
                    page === result.page ? "bg-forest text-white" : "border border-line bg-white"
                  }`}
                >
                  {page}
                </Link>
              ))}
            </nav>
          ) : null}
        </section>
      </div>
    </div>
  );
}
