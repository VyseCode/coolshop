import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { formatCoolCash, formatDate, formatMoney } from "@/domain/format";
import { logoutAction } from "@/lib/actions/auth";
import { getSession } from "@/lib/auth/session";
import { listOrders } from "@/lib/services/order.service";
import { getAddresses } from "@/lib/services/address.service";
import { getWallet } from "@/lib/services/wallet.service";
import { getWishlist } from "@/lib/services/wishlist.service";
import { ProductCard } from "@/components/product/product-card";
import { AddressBook } from "@/components/account/address-book";
import { secondaryButtonClass } from "@/components/ui/classes";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/account/login?next=/account");
  const [orders, wallet, addresses, saved] = await Promise.all([
    listOrders(session.id),
    getWallet(session.id),
    getAddresses(session.id),
    getWishlist(session.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Account</p>
      <h1 className="mt-2 font-display text-5xl">{session.name}</h1>
      <p className="mt-2 text-muted">{session.email}</p>
      <section className="mt-8 rounded-[2rem] border border-line bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">CoolCash</p>
        <p className="mt-2 font-display text-4xl">{formatCoolCash(wallet.balanceCents)}</p>
        <p className="mt-2 text-sm text-muted">Test currency. 1 CC spends like $1. New accounts start with CC 500.00.</p>
        {wallet.entries.length > 0 ? (
          <ul className="mt-4 divide-y divide-line text-sm">
            {wallet.entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-2">
                <span>
                  <span className="block">{entry.note}</span>
                  <span className="text-xs text-muted">{formatDate(entry.createdAt)}</span>
                </span>
                <span className={entry.amountCents < 0 ? "text-copper" : "text-forest"}>
                  {entry.amountCents < 0 ? "−" : "+"}
                  {formatCoolCash(Math.abs(entry.amountCents))}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <form action={logoutAction} className="mt-6">
        <button className={secondaryButtonClass} type="submit">
          Sign out
        </button>
      </form>

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl">Saved</h2>
          <Link href="/wishlist" className="text-sm font-medium text-forest hover:underline">
            View all
          </Link>
        </div>
        {saved.length === 0 ? (
          <p className="mt-4 text-muted">Tap the heart on a product to save it.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {saved.slice(0, 4).map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <AddressBook addresses={addresses} />

      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl">Recent orders</h2>
          <Link href="/orders" className="text-sm font-medium text-forest hover:underline">
            View all
          </Link>
        </div>
        {orders.items.length === 0 ? (
          <p className="mt-4 text-muted">No orders yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.items.slice(0, 3).map((order) => (
              <li key={order.id}>
                <Link href={`/orders/${order.id}`} className="flex items-center justify-between rounded-2xl border border-line bg-card px-4 py-3 hover:border-forest/30">
                  <span>
                    <span className="block font-medium">{order.orderNumber}</span>
                    <span className="text-sm text-muted">{formatDate(order.createdAt)}</span>
                  </span>
                  <span className="text-sm font-semibold">{formatMoney(order.quote.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
