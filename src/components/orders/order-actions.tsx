"use client";

import { useActionState } from "react";

import type { FormState } from "@/domain/types";
import { cancelOrderAction, deliverOrderAction, shipOrderAction } from "@/lib/actions/order";
import {
  approveReturnAction,
  deskCancelOrderAction,
  rejectReturnAction,
} from "@/lib/actions/returns";
import { primaryButtonClass, secondaryButtonClass } from "@/components/ui/classes";

function ActionForm({
  orderId,
  action,
  label,
  pendingLabel,
  tone,
}: {
  orderId: string;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  label: string;
  pendingLabel: string;
  tone: "primary" | "secondary";
}) {
  const [state, formAction, pending] = useActionState(action, null as FormState);
  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="orderId" value={orderId} />
      <button className={tone === "primary" ? primaryButtonClass : secondaryButtonClass} disabled={pending}>
        {pending ? pendingLabel : label}
      </button>
      {state?.error ? <p className="text-sm text-copper">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-forest">Updated.</p> : null}
    </form>
  );
}

export function CancelOrderButton({ orderId }: { orderId: string }) {
  return (
    <ActionForm
      orderId={orderId}
      action={cancelOrderAction}
      label="Cancel order"
      pendingLabel="Cancelling…"
      tone="secondary"
    />
  );
}

export function DeskCancelOrderButton({ orderId }: { orderId: string }) {
  return (
    <ActionForm
      orderId={orderId}
      action={deskCancelOrderAction}
      label="Cancel & refund"
      pendingLabel="Cancelling…"
      tone="secondary"
    />
  );
}

export function ShipOrderButton({ orderId }: { orderId: string }) {
  return (
    <ActionForm orderId={orderId} action={shipOrderAction} label="Mark shipped" pendingLabel="Saving…" tone="primary" />
  );
}

export function DeliverOrderButton({ orderId }: { orderId: string }) {
  return (
    <ActionForm
      orderId={orderId}
      action={deliverOrderAction}
      label="Mark delivered"
      pendingLabel="Saving…"
      tone="primary"
    />
  );
}

function ReturnDecisionForm({
  returnId,
  action,
  label,
  pendingLabel,
  tone,
}: {
  returnId: string;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  label: string;
  pendingLabel: string;
  tone: "primary" | "secondary";
}) {
  const [state, formAction, pending] = useActionState(action, null as FormState);
  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="returnId" value={returnId} />
      <input
        name="deskNote"
        placeholder="Optional note"
        className="w-full rounded-2xl border border-line bg-card px-3 py-2 text-sm outline-none focus:border-forest"
      />
      <button className={tone === "primary" ? primaryButtonClass : secondaryButtonClass} disabled={pending}>
        {pending ? pendingLabel : label}
      </button>
      {state?.error ? <p className="text-sm text-copper">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-forest">Updated.</p> : null}
    </form>
  );
}

export function ApproveReturnButton({ returnId }: { returnId: string }) {
  return (
    <ReturnDecisionForm
      returnId={returnId}
      action={approveReturnAction}
      label="Approve return"
      pendingLabel="Approving…"
      tone="primary"
    />
  );
}

export function RejectReturnButton({ returnId }: { returnId: string }) {
  return (
    <ReturnDecisionForm
      returnId={returnId}
      action={rejectReturnAction}
      label="Reject return"
      pendingLabel="Saving…"
      tone="secondary"
    />
  );
}
