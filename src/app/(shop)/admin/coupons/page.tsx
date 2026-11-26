import type { Metadata } from "next";

import { formatMoney } from "@/domain/format";
import { CouponForm } from "@/components/admin/coupon-form";
import { requireAdminPage } from "@/lib/auth/admin";
import { listCoupons } from "@/lib/services/coupon.service";

export const metadata: Metadata = { title: "Coupons" };

export default async function CouponsPage() {
  const session = await requireAdminPage("/admin/coupons");
  const coupons = await listCoupons(session);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-5xl tracking-tight">Coupons</h1>
      <p className="mt-2 max-w-2xl text-muted">
        One code per order. Cancelling the order frees that use. Percent is taken off the subtotal before tax.
      </p>
      <ul className="mt-8 divide-y divide-line rounded-[2rem] border border-line bg-card">
        {coupons.map((coupon) => (
          <li key={coupon.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-medium">{coupon.code}</p>
              <p className="text-sm text-muted">
                {coupon.kind === "percent" ? `${coupon.amount}% off` : `${formatMoney(coupon.amount)} off`}
                {coupon.minSubtotal > 0 ? ` · min ${formatMoney(coupon.minSubtotal)}` : ""}
                {coupon.maxUses != null ? ` · ${coupon.uses}/${coupon.maxUses} uses` : ` · ${coupon.uses} uses`}
                {coupon.expiresAt ? ` · until ${coupon.expiresAt.slice(0, 10)}` : ""}
              </p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-forest">
              {coupon.active ? "Active" : "Off"}
            </span>
          </li>
        ))}
      </ul>
      {coupons.length === 0 ? <p className="mt-4 text-muted">No codes yet.</p> : null}
      <div className="mt-8">
        <CouponForm />
      </div>
    </div>
  );
}
