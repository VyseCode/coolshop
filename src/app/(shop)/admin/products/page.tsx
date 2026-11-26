import type { Metadata } from "next";
import Link from "next/link";

import { formatMoney } from "@/domain/format";
import { primaryButtonClass } from "@/components/ui/classes";
import { requireAdminPage } from "@/lib/auth/admin";
import { listDeskProducts } from "@/lib/services/catalog-admin.service";

export const metadata: Metadata = { title: "Product desk" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminPage("/admin/products");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const page = Number(typeof params.page === "string" ? params.page : 1);
  const products = await listDeskProducts(session, { q, page: Number.isFinite(page) ? page : 1 });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tight">Products</h1>
          <p className="mt-2 text-muted">Edits show on the store without reseeding.</p>
        </div>
        <Link href="/admin/products/new" className={primaryButtonClass}>
          New product
        </Link>
      </div>
      <form action="/admin/products" className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name"
          aria-label="Search products"
          className="w-full max-w-sm rounded-full border border-line bg-white px-4 py-2 text-sm"
        />
        <button className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium">Search</button>
      </form>
      <ul className="mt-6 divide-y divide-line rounded-[2rem] border border-line bg-card">
        {products.items.map((product) => (
          <li key={product.id}>
            <Link href={`/admin/products/${product.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-sand/60">
              <span>
                <span className="block font-medium">{product.name}</span>
                <span className="text-sm text-muted">
                  {product.brand} · {product.categoryName} · {product.stock} in stock
                  {product.status === "archived" ? " · Archived" : ""}
                  {product.featured ? " · Featured" : ""}
                </span>
              </span>
              <span className="text-sm font-semibold">{formatMoney(product.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
      {products.total === 0 ? <p className="mt-6 text-muted">No products match.</p> : null}
    </div>
  );
}
