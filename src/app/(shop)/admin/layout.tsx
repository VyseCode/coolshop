import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session && session.role !== "admin") redirect("/");
  return (
    <div>
      <div className="border-b border-line bg-sand">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 lg:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest">Desk</p>
          <nav className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/admin" className="hover:underline">
              Overview
            </Link>
            <Link href="/admin/orders" className="hover:underline">
              Orders
            </Link>
            <Link href="/admin/returns" className="hover:underline">
              Returns
            </Link>
            <Link href="/admin/products" className="hover:underline">
              Products
            </Link>
            <Link href="/admin/coupons" className="hover:underline">
              Coupons
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
