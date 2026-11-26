import type { Metadata } from "next";
import Link from "next/link";

import { ProductImage } from "@/components/product/product-image";
import { formatMoney } from "@/domain/format";
import { requireAdminPage } from "@/lib/auth/admin";
import { getDeskDashboard } from "@/lib/services/dashboard.service";

export const metadata: Metadata = { title: "Desk" };

export default async function AdminDashboardPage() {
  const session = await requireAdminPage("/admin");
  const desk = await getDeskDashboard(session);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-5xl tracking-tight">Desk</h1>
      <p className="mt-2 text-muted">Sales pulse, open work, and stock that needs a refill.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Net revenue" value={formatMoney(desk.revenueCents)} hint={`${desk.paidOrderCount} paid orders`} />
        <Stat label="Open orders" value={String(desk.openOrders)} hint="Placed, paid, or shipped" />
        <Stat label="Open returns" value={String(desk.openReturns)} hint="Waiting on a decision" />
        <Stat
          label="Refunded"
          value={formatMoney(desk.refundedCents)}
          hint={`Gross ${formatMoney(desk.grossCents)}`}
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-3xl">Low stock</h2>
            <Link href="/admin/products" className="text-sm font-medium text-forest hover:underline">
              Products
            </Link>
          </div>
          {desk.lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Everything is above five units.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {desk.lowStock.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="flex items-center gap-3 rounded-3xl border border-line bg-card p-3 hover:border-forest/30"
                  >
                    <div className="relative size-12 overflow-hidden rounded-2xl bg-sand">
                      {product.image ? (
                        <ProductImage src={product.image} alt="" sizes="48px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="text-sm text-muted">{product.brand}</p>
                    </div>
                    <span className="text-sm font-semibold text-copper">{product.stock} left</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-3xl">Coupons</h2>
            <Link href="/admin/coupons" className="text-sm font-medium text-forest hover:underline">
              Manage
            </Link>
          </div>
          {desk.coupons.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No coupon redemptions yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {desk.coupons.map((coupon) => (
                <li
                  key={coupon.code}
                  className="flex items-center justify-between gap-3 rounded-3xl border border-line bg-card px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{coupon.code}</p>
                    <p className="text-sm text-muted">{coupon.uses} uses</p>
                  </div>
                  <p className="text-sm font-semibold">{formatMoney(coupon.discountCents)} off</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3 text-sm font-medium">
        <Link href="/admin/orders" className="rounded-full border border-line bg-card px-4 py-2 hover:border-forest/40">
          Orders
        </Link>
        <Link href="/admin/returns" className="rounded-full border border-line bg-card px-4 py-2 hover:border-forest/40">
          Returns
        </Link>
        <Link href="/admin/products" className="rounded-full border border-line bg-card px-4 py-2 hover:border-forest/40">
          Products
        </Link>
        <Link href="/admin/coupons" className="rounded-full border border-line bg-card px-4 py-2 hover:border-forest/40">
          Coupons
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[2rem] border border-line bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-3 font-display text-3xl tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-muted">{hint}</p>
    </div>
  );
}
