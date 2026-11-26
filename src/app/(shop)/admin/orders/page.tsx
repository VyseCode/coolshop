import type { Metadata } from "next";
import Link from "next/link";

import { formatCoolCash, formatDate, formatMoney } from "@/domain/format";
import { orderStatusLabel, paymentLabel } from "@/domain/orders";
import { requireAdminPage } from "@/lib/auth/admin";
import { listDeskOrders } from "@/lib/services/order.service";

export const metadata: Metadata = { title: "Order desk" };

export default async function AdminOrdersPage() {
  const session = await requireAdminPage("/admin/orders");
  const orders = await listDeskOrders(session);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-5xl tracking-tight">Orders</h1>
      <p className="mt-2 text-muted">Move paid and placed orders to shipped, then to delivered.</p>
      {orders.items.length === 0 ? (
        <p className="mt-8 text-muted">No orders yet.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.items.map((order) => (
            <li key={order.id}>
              <Link href={`/admin/orders/${order.id}`} className="block rounded-3xl border border-line bg-card p-5 hover:border-forest/30">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted">
                      {order.email} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-forest">
                    {orderStatusLabel[order.status]}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted">
                  {paymentLabel(order.paymentMethod)} · {formatMoney(order.quote.total)} · {formatCoolCash(order.quote.total)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
