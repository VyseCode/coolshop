import type { Metadata } from "next";
import Link from "next/link";

import { ApproveReturnButton, RejectReturnButton } from "@/components/orders/order-actions";
import { formatDate, formatMoney } from "@/domain/format";
import { returnStatusLabel } from "@/domain/orders";
import { requireAdminPage } from "@/lib/auth/admin";
import { listAllDeskReturns } from "@/lib/services/return.service";

export const metadata: Metadata = { title: "Returns" };

export default async function AdminReturnsPage() {
  const session = await requireAdminPage("/admin/returns");
  const returns = await listAllDeskReturns(session);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-5xl tracking-tight">Returns</h1>
      <p className="mt-2 text-muted">Approve to restock and refund CoolCash, or reject with a note.</p>
      {returns.items.length === 0 ? (
        <p className="mt-8 text-muted">No returns yet.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {returns.items.map((entry) => (
            <li key={entry.id} className="rounded-[2rem] border border-line bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/admin/orders/${entry.orderId}`} className="font-medium hover:text-forest">
                    {entry.orderNumber}
                  </Link>
                  <p className="text-sm text-muted">
                    {entry.email} · {formatDate(entry.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-forest">
                  {returnStatusLabel[entry.status]}
                </span>
              </div>
              <p className="mt-3 text-sm">{entry.reason}</p>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                {entry.items.map((item) => (
                  <li key={`${entry.id}-${item.productId}`}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm font-semibold">Refund {formatMoney(entry.refundCents)}</p>
              {entry.deskNote ? <p className="mt-2 text-sm text-muted">Note: {entry.deskNote}</p> : null}
              {entry.status === "requested" ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <ApproveReturnButton returnId={entry.id} />
                  <RejectReturnButton returnId={entry.id} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
