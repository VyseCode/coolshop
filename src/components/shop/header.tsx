import { Package, ShoppingBag, UserRound, Wallet } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { formatCoolCash, formatMoney } from "@/domain/format";
import { FREE_SHIPPING_CENTS } from "@/domain/pricing";
import { getExistingOwnerKey } from "@/lib/auth/owner";
import { getSession } from "@/lib/auth/session";
import { emptyCart, getCart } from "@/lib/services/cart.service";
import { listCategories } from "@/lib/services/catalog.service";
import { getWallet } from "@/lib/services/wallet.service";
import { CategoryNav } from "@/components/shop/category-nav";
import { SearchForm } from "@/components/shop/search-form";
import { WishlistNavLink } from "@/components/wishlist/wishlist-button";

export async function ShopHeader() {
  const [categories, session, ownerKey] = await Promise.all([
    listCategories(),
    getSession(),
    getExistingOwnerKey(),
  ]);
  const [cart, wallet] = await Promise.all([
    ownerKey ? getCart(ownerKey) : Promise.resolve(emptyCart()),
    session ? getWallet(session.id) : Promise.resolve(null),
  ]);
  const accountHref = session ? "/account" : "/account/login";

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-ink text-center text-xs tracking-wide text-sand">
        <p className="px-4 py-2">
          Free shipping over {formatMoney(FREE_SHIPPING_CENTS)} · Pay with CoolCash · 1 CC = $1
        </p>
      </div>
      <div className="bg-forest text-paper">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:gap-6 lg:px-6">
          <Link href="/" className="font-display text-[1.7rem] leading-none tracking-tight">
            CoolShop
          </Link>
          <div className="hidden min-w-0 flex-1 md:block">
            <Suspense fallback={<div className="h-10 rounded-full bg-white/15" />}>
              <SearchForm id="site-search" />
            </Suspense>
          </div>
          <nav className="ml-auto flex items-center gap-1 text-sm">
            {wallet ? (
              <Link href="/account" className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5 text-xs font-semibold">
                <Wallet className="size-3.5" />
                {formatCoolCash(wallet.balanceCents)}
              </Link>
            ) : null}
            {session?.role === "admin" ? (
              <Link href="/admin" className="hidden rounded-full px-2.5 py-2 hover:bg-white/10 sm:inline">
                Desk
              </Link>
            ) : null}
            <Link href={accountHref} className="inline-flex items-center gap-2 rounded-full px-2.5 py-2 hover:bg-white/10">
              <UserRound className="size-4" />
              <span className="hidden lg:inline">{session ? session.name.split(" ")[0] : "Account"}</span>
            </Link>
            <WishlistNavLink />
            <Link href="/orders" className="inline-flex items-center gap-2 rounded-full px-2.5 py-2 hover:bg-white/10">
              <Package className="size-4" />
              <span className="hidden lg:inline">Orders</span>
            </Link>
            <Link href="/cart" className="relative inline-flex items-center gap-2 rounded-full px-2.5 py-2 hover:bg-white/10">
              <ShoppingBag className="size-4" />
              <span className="hidden lg:inline">Bag</span>
              {cart.itemCount > 0 ? (
                <span className="grid min-w-5 place-items-center rounded-full bg-copper px-1.5 text-[11px] font-semibold text-white">
                  {cart.itemCount > 99 ? "99+" : cart.itemCount}
                </span>
              ) : null}
            </Link>
          </nav>
        </div>
        <div className="px-4 pb-3 md:hidden">
          <Suspense fallback={<div className="h-10 rounded-full bg-white/15" />}>
            <SearchForm id="site-search-mobile" />
          </Suspense>
        </div>
      </div>
      <div className="border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-2 lg:px-6">
          <Suspense fallback={<div className="h-8" />}>
            <CategoryNav categories={categories} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
