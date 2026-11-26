"use client";

import Link from "next/link";
import { useActionState } from "react";

import { adminAccount, coolCash, demoAccount } from "@/config/site";
import { formatCoolCash } from "@/domain/format";
import type { FormState } from "@/domain/types";
import { loginAction, registerAction } from "@/lib/actions/auth";
import { inputClass, primaryButtonClass, quietLinkClass } from "@/components/ui/classes";

function Field({
  label,
  name,
  type,
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  error?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        aria-invalid={error ? true : undefined}
        className={`${inputClass} mt-1.5`}
      />
      {error ? <span className="mt-1 block text-copper">{error}</span> : null}
    </label>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, null as FormState);
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div className="rounded-2xl bg-mint px-4 py-3 text-sm">
        <p className="font-medium text-forest">Demo accounts</p>
        <p className="mt-1 text-muted">
          Shopper {demoAccount.email} / {demoAccount.password}
          <br />
          Starts with {formatCoolCash(coolCash.demoBalanceCents)}
          <br />
          Desk {adminAccount.email} / {adminAccount.password}
        </p>
      </div>
      <Field label="Email" name="email" type="email" autoComplete="email" error={state?.fieldErrors?.email} />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        error={state?.fieldErrors?.password}
      />
      {state?.error ? (
        <p className="text-sm text-copper" role="alert">
          {state.error}
        </p>
      ) : null}
      <button className={`${primaryButtonClass} w-full`} disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-sm text-muted">
        New here?{" "}
        <Link href={`/account/register?next=${encodeURIComponent(next)}`} className={quietLinkClass}>
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(registerAction, null as FormState);
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="Name" name="name" type="text" autoComplete="name" error={state?.fieldErrors?.name} />
      <Field label="Email" name="email" type="email" autoComplete="email" error={state?.fieldErrors?.email} />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        error={state?.fieldErrors?.password}
      />
      {state?.error ? (
        <p className="text-sm text-copper" role="alert">
          {state.error}
        </p>
      ) : null}
      <button className={`${primaryButtonClass} w-full`} disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link href={`/account/login?next=${encodeURIComponent(next)}`} className={quietLinkClass}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
