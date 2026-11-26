import type { Metadata } from "next";

import { formatCoolCash } from "@/domain/format";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { secondaryButtonClass } from "@/components/ui/classes";
import { getSession } from "@/lib/auth/session";
import { getCart } from "@/lib/services/cart.service";
import { getAddresses } from "@/lib/services/address.service";
import { getWallet } from "@/lib/services/wallet.service";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/account/login?next=/checkout");
  const [cart, wallet, addresses] = await Promise.all([
    getCart(`user:${session.id}`),
    getWallet(session.id),
    getAddresses(session.id),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-5xl tracking-tight">Checkout</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Signed in as {session.email}. CoolCash balance {formatCoolCash(wallet.balanceCents)}. This demo spends test currency and reserves stock.
      </p>
      {cart.items.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-dashed border-line bg-card px-6 py-16">
          <p>Your bag is empty.</p>
          <Link href="/search" className={`${secondaryButtonClass} mt-4`}>
            Browse the catalog
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <CheckoutForm cart={cart} balanceCents={wallet.balanceCents} addresses={addresses} />
        </div>
      )}
    </div>
  );
}
