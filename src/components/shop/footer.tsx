import Link from "next/link";

import { site } from "@/config/site";

export function ShopFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-forest-deep text-sand">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div>
          <p className="font-display text-3xl text-white">{site.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-sand/80">{site.description}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/search" className="hover:text-white">All departments</Link></li>
            <li><Link href="/c/electronics" className="hover:text-white">Electronics</Link></li>
            <li><Link href="/c/home" className="hover:text-white">Home</Link></li>
            <li><Link href="/c/fashion" className="hover:text-white">Fashion</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Account</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/account" className="hover:text-white">Your account</Link></li>
            <li><Link href="/orders" className="hover:text-white">Orders</Link></li>
            <li><Link href="/cart" className="hover:text-white">Bag</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Help</p>
          <p className="mt-3 text-sm leading-6 text-sand/80">
            CoolCash is the test balance. Orders spend it or stay unpaid until delivery, and cancelling a CoolCash order returns the balance.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-sand/70">
        © {new Date().getFullYear()} {site.name}
      </div>
    </footer>
  );
}
