"use client";

import { useActionState } from "react";

import type { FormState } from "@/domain/types";
import { createCouponAction } from "@/lib/actions/coupon";
import { inputClass, primaryButtonClass } from "@/components/ui/classes";

export function CouponForm() {
  const [state, action, pending] = useActionState(createCouponAction, null as FormState);
  return (
    <form action={action} className="grid gap-4 rounded-[2rem] border border-line bg-card p-5 sm:grid-cols-2">
      <h2 className="font-display text-3xl sm:col-span-2">New code</h2>
      <label className="block text-sm">
        <span className="font-medium">Code</span>
        <input name="code" required placeholder="WELCOME10" className={`${inputClass} mt-1.5 uppercase`} />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Type</span>
        <select name="kind" defaultValue="percent" className={`${inputClass} mt-1.5`}>
          <option value="percent">Percent off</option>
          <option value="fixed">Fixed amount off</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-medium">Amount</span>
        <input name="amount" required inputMode="decimal" placeholder="10 or 5.00" className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Minimum subtotal (USD)</span>
        <input name="minSubtotal" inputMode="decimal" placeholder="Optional" className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Max uses</span>
        <input name="maxUses" inputMode="numeric" placeholder="Unlimited" className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Expires</span>
        <input name="expiresAt" type="date" className={`${inputClass} mt-1.5`} />
      </label>
      {state?.error ? <p className="text-sm text-copper sm:col-span-2">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-forest sm:col-span-2">Code saved.</p> : null}
      <button className={`${primaryButtonClass} w-fit`} disabled={pending}>
        {pending ? "Saving…" : "Create code"}
      </button>
    </form>
  );
}
