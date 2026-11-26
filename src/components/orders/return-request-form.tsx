"use client";

import { useActionState } from "react";

import { formatMoney } from "@/domain/format";
import type { FormState, OrderItemDTO } from "@/domain/types";
import { requestReturnAction } from "@/lib/actions/returns";
import { primaryButtonClass } from "@/components/ui/classes";

type ReturnableItem = OrderItemDTO & { returnable: number };

export function ReturnRequestForm({
  orderId,
  items,
}: {
  orderId: string;
  items: ReturnableItem[];
}) {
  const available = items.filter((item) => item.returnable > 0);
  const [state, formAction, pending] = useActionState(requestReturnAction, null as FormState);

  if (available.length === 0) {
    return <p className="text-sm text-muted">Nothing left to return on this order.</p>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <ul className="space-y-3">
        {available.map((item) => (
          <li key={item.productId} className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium">{item.name}</p>
              <p className="text-muted">
                Up to {item.returnable} · {formatMoney(item.unitPrice)} each
              </p>
            </div>
            <label className="flex items-center gap-2">
              <span className="text-muted">Qty</span>
              <select
                name={`qty:${item.productId}`}
                defaultValue="0"
                className="rounded-xl border border-line bg-card px-2 py-1.5 outline-none focus:border-forest"
              >
                {Array.from({ length: item.returnable + 1 }, (_, qty) => (
                  <option key={qty} value={qty}>
                    {qty}
                  </option>
                ))}
              </select>
            </label>
          </li>
        ))}
      </ul>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Reason</span>
        <textarea
          name="reason"
          rows={3}
          required
          minLength={8}
          maxLength={400}
          placeholder="Damaged, wrong item, changed mind…"
          className="w-full rounded-2xl border border-line bg-card px-3 py-2 text-sm outline-none focus:border-forest"
        />
        {state?.fieldErrors?.reason ? <p className="text-sm text-copper">{state.fieldErrors.reason}</p> : null}
      </label>
      <button className={primaryButtonClass} disabled={pending}>
        {pending ? "Submitting…" : "Request return"}
      </button>
      {state?.error ? <p className="text-sm text-copper">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-forest">Return requested. The desk will review it.</p> : null}
    </form>
  );
}
