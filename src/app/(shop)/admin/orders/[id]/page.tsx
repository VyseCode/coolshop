import type { Metadata } from "next";
import Link from "next/link";

import { ProductImage } from "@/components/product/product-image";
import { notFound } from "next/navigation";

import { formatDate, formatMoney } from "@/domain/format";
import {
  canCancelOrder,
  canDeliverOrder,
  canShipOrder,
  orderStatusLabel,
  paymentLabel,
  paymentStatusLabel,
  returnStatusLabel,
} from "@/domain/orders";
import { countryName } from "@/domain/pricing";
import {
  ApproveReturnButton,
  DeliverOrderButton,
  DeskCancelOrderButton,
  RejectReturnButton,
  ShipOrderButton,
} from "@/components/orders/order-actions";
import { QuoteSummary } from "@/components/shop/quote-summary";
import { requireAdminPage } from "@/lib/auth/admin";
import { getDeskOrderWithReturns } from "@/lib/services/return.service";

export const metadata: Metadata = { title: "Desk order" };

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAdminPage(`/admin/orders/${id}`);
  const order = await getDeskOrderWithReturns(session, id);
  if (!order) notFound();
  const address = order.shippingAddress;
  const returns = order.returns ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-6">
      <Link href="/admin/orders" className="text-sm font-medium text-forest hover:underline">
        All orders
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl">{order.orderNumber}</h1>
          <p className="mt-2 text-sm text-muted">
            {order.email} · {formatDate(order.createdAt)}
          </p>
        </div>
        <span className="rounded-full bg-mint px-3 py-1 text-sm font-semibold text-forest">
          {orderStatusLabel[order.status]}
        </span>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-line bg-card p-5">
            <h2 className="font-medium">Items</h2>
            <ul className="mt-4 space-y-4">
              {order.items.map((item) => (
                <li key={`${item.productId}-${item.slug}`} className="flex gap-3">
                  <div className="relative size-16 overflow-hidden rounded-2xl bg-sand">
                    {item.image ? <ProductImage src={item.image} alt="" sizes="64px" className="object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatMoney(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
          </section>

          {returns.length > 0 ? (
            <section className="rounded-[2rem] border border-line bg-card p-5">
              <h2 className="font-medium">Returns</h2>
              <ul className="mt-4 space-y-4">
                {returns.map((entry) => (
                  <li key={entry.id} className="rounded-2xl border border-line p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-muted">{formatDate(entry.createdAt)}</p>
                      <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-forest">
                        {returnStatusLabel[entry.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{entry.reason}</p>
                    <p className="mt-2 text-sm text-muted">
                      {entry.items.map((item) => `${item.name} × ${item.quantity}`).join(" · ")}
                    </p>
                    <p className="mt-2 text-sm font-semibold">Refund {formatMoney(entry.refundCents)}</p>
                    {entry.status === "requested" ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <ApproveReturnButton returnId={entry.id} />
                        <RejectReturnButton returnId={entry.id} />
                      </div>
                    ) : entry.deskNote ? (
                      <p className="mt-2 text-sm text-muted">Note: {entry.deskNote}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <div className="space-y-4">
          <section className="rounded-[2rem] border border-line bg-card p-5">
            <h2 className="font-medium">Ship to</h2>
            <p className="mt-3 text-sm leading-6">
              {address.fullName}
              <br />
              {address.line1}
              {address.line2 ? (
                <>
                  <br />
                  {address.line2}
                </>
              ) : null}
              <br />
              {address.city}, {address.region} {address.postalCode}
              <br />
              {countryName(address.country)}
            </p>
            <p className="mt-3 text-sm text-muted">
              {paymentLabel(order.paymentMethod)} · {paymentStatusLabel(order.paymentStatus)}
            </p>
            {order.refundedCents > 0 ? (
              <p className="mt-2 text-sm text-muted">Refunded {formatMoney(order.refundedCents)}</p>
            ) : null}
            <div className="mt-4 space-y-3">
              {canShipOrder(order.status) ? <ShipOrderButton orderId={order.id} /> : null}
              {canDeliverOrder(order.status) ? <DeliverOrderButton orderId={order.id} /> : null}
              {canCancelOrder(order.status) ? (
                <div>
                  <DeskCancelOrderButton orderId={order.id} />
                  <p className="mt-2 text-xs text-muted">
                    Cancels before shipping, restocks, and returns CoolCash when it was captured.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
          <section className="rounded-[2rem] border border-line bg-card p-5">
            <QuoteSummary quote={order.quote} />
          </section>
        </div>
      </div>
    </div>
  );
}
