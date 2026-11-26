import type { Metadata } from "next";

import { coolCash } from "@/config/site";
import { formatCoolCash } from "@/domain/format";
import { redirect } from "next/navigation";

import { safeNextPath } from "@/domain/catalog-query";
import { RegisterForm } from "@/components/auth/auth-forms";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : undefined, "/account");
  const session = await getSession();
  if (session) redirect(next);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="rounded-[2rem] border border-line bg-card p-6 shadow-[0_24px_60px_-40px_rgba(20,33,28,0.45)] sm:p-8">
        <h1 className="font-display text-5xl tracking-tight">Create account</h1>
        <p className="mt-2 text-sm text-muted">
          New accounts receive {formatCoolCash(coolCash.welcomeCents)} to spend at checkout.
        </p>
        <RegisterForm next={next} />
      </div>
    </div>
  );
}
