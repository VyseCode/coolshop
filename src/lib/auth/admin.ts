import "server-only";

import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";

export async function requireAdminPage(nextPath = "/admin/orders") {
  const session = await getSession();
  if (!session) redirect(`/account/login?next=${encodeURIComponent(nextPath)}`);
  if (session.role !== "admin") redirect("/");
  return session;
}
