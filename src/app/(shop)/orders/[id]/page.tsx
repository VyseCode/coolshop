import type { Metadata } from "next";
import Link from "next/link";

import { ProductImage } from "@/components/product/product-image";
import { notFound, redirect } from "next/navigation";

import { formatDate, formatMoney } from "@/domain/format";
import {
  canCancelOrder,
  canRequestReturn,
  orderStatusLabel,
  paymentLabel,
  paymentStatusLabel,
  returnStatusLabel,
} from "@/domain/orders";
import { countryName } from "@/domain/pricing";
import { CancelOrderButton } from "@/components/orders/order-actions";
import { ReturnRequestForm } from "@/components/orders/return-request-form";
import { QuoteSummary } from "@/components/shop/quote-summary";
import { getSession } from "@/lib/auth/session";
import { getOrderWithReturns, remainingReturnable } from "@/lib/services/return.service";

export const metadata: Metadata = { title: "Order" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/account/login?next=/orders");
  const { id } = await params;
  const order = await getOrderWithReturns(id, session.id);
  if (!order) notFound();
  const address = order.shippingAddress;
  const returns = order.returns ?? [];
  const returnable = remainingReturnable(order, returns);
  const canReturn = canRequestReturn(order.status) && returnable.some((item) => item.returnable > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-6">
      <Link href="/orders" className="text-sm font-medium text-forest hover:underline">
        All orders
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Order</p>
          <h1 className="mt-1 font-display text-4xl sm:text-5xl">{order.orderNumber}</h1>
          <p className="mt-2 text-sm text-muted">{formatDate(order.createdAt)}</p>
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
                  <Link href={`/product/${item.slug}`} className="relative size-16 overflow-hidden rounded-2xl bg-sand">
                    {item.image ? <ProductImage src={item.image} alt="" sizes="64px" className="object-cover" /> : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${item.slug}`} className="font-medium hover:text-forest">
                      {item.name}
                    </Link>
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
                    {entry.deskNote ? <p className="mt-2 text-sm text-muted">Desk: {entry.deskNote}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {canReturn ? (
            <section className="rounded-[2rem] border border-line bg-card p-5">
              <h2 className="font-medium">Request a return</h2>
              <p className="mt-2 text-sm text-muted">
                Choose items after delivery. Approved CoolCash orders get the refund back to your wallet.
              </p>
              <div className="mt-4">
                <ReturnRequestForm orderId={order.id} items={returnable} />
              </div>
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
              <br />
              {address.phone}
            </p>
            <p className="mt-3 text-sm text-muted">
              {paymentLabel(order.paymentMethod)} · {paymentStatusLabel(order.paymentStatus)}
            </p>
            {order.refundedCents > 0 ? (
              <p className="mt-2 text-sm text-muted">Refunded so far {formatMoney(order.refundedCents)}</p>
            ) : null}
            {canCancelOrder(order.status) ? (
              <div className="mt-4">
                <CancelOrderButton orderId={order.id} />
                <p className="mt-2 text-xs text-muted">
                  {order.paymentMethod === "wallet"
                    ? "Cancelling returns the CoolCash and puts the items back in stock."
                    : "Cancelling puts the items back in stock."}
                </p>
              </div>
            ) : null}
          </section>
          <section className="rounded-[2rem] border border-line bg-card p-5">
            <QuoteSummary quote={order.quote} />
          </section>
        </div>
      </div>
    </div>
  );
}
