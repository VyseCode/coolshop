import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { formatDate, formatMoney } from "@/domain/format";
import { orderStatusLabel } from "@/domain/orders";
import { getSession } from "@/lib/auth/session";
import { listOrders } from "@/lib/services/order.service";
import { primaryButtonClass } from "@/components/ui/classes";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/account/login?next=/orders");
  const orders = await listOrders(session.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-5xl tracking-tight">Orders</h1>
      {orders.items.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-dashed border-line bg-card px-6 py-16">
          <p>You have not placed an order yet.</p>
          <Link href="/search" className={`${primaryButtonClass} mt-5`}>
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.items.map((order) => (
            <li key={order.id}>
              <Link href={`/orders/${order.id}`} className="block rounded-3xl border border-line bg-card p-5 hover:border-forest/30">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-forest">
                    {orderStatusLabel[order.status]}
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"} · {formatMoney(order.quote.total)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
