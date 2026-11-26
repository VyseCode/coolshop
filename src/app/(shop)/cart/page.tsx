import type { Metadata } from "next";
import Link from "next/link";

import { ProductImage } from "@/components/product/product-image";

import { formatMoney } from "@/domain/format";
import { removeCartAction, updateCartAction } from "@/lib/actions/cart";
import { getExistingOwnerKey } from "@/lib/auth/owner";
import { getSession } from "@/lib/auth/session";
import { emptyCart, getCart } from "@/lib/services/cart.service";
import { QuoteSummary } from "@/components/shop/quote-summary";
import { primaryButtonClass, secondaryButtonClass } from "@/components/ui/classes";

export const metadata: Metadata = { title: "Bag" };

export default async function CartPage() {
  const ownerKey = await getExistingOwnerKey();
  const [cart, session] = await Promise.all([
    ownerKey ? getCart(ownerKey) : Promise.resolve(emptyCart()),
    getSession(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-5xl tracking-tight">Your bag</h1>
      {cart.items.length === 0 ? (
        <div className="mt-8 max-w-xl rounded-[2rem] border border-dashed border-line bg-card px-6 py-16">
          <p className="text-lg">Nothing here yet.</p>
          <p className="mt-2 text-muted">Add a piece from the catalog. Guests keep a bag on this browser until they sign in.</p>
          <Link href="/search" className={`${primaryButtonClass} mt-6`}>
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ul className="space-y-4">
            {cart.items.map((item) => (
              <li key={item.productId} className="flex gap-4 rounded-3xl border border-line bg-card p-4">
                <Link href={`/product/${item.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-sand sm:size-28">
                  {item.image ? <ProductImage src={item.image} alt="" sizes="112px" className="object-cover" /> : null}
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">{item.brand}</p>
                  <Link href={`/product/${item.slug}`} className="font-medium hover:text-forest">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm">{formatMoney(item.unitPrice)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-line bg-white">
                      <form action={updateCartAction}>
                        <input type="hidden" name="productId" value={item.productId} />
                        <input type="hidden" name="quantity" value={item.quantity - 1} />
                        <button type="submit" aria-label={`Decrease quantity of ${item.name}`} className="grid size-9 place-items-center">
                          −
                        </button>
                      </form>
                      <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                      <form action={updateCartAction}>
                        <input type="hidden" name="productId" value={item.productId} />
                        <input type="hidden" name="quantity" value={item.quantity + 1} />
                        <button
                          type="submit"
                          aria-label={`Increase quantity of ${item.name}`}
                          disabled={item.quantity >= item.stock || item.quantity >= 20}
                          className="grid size-9 place-items-center disabled:opacity-40"
                        >
                          +
                        </button>
                      </form>
                    </div>
                    <form action={removeCartAction}>
                      <input type="hidden" name="productId" value={item.productId} />
                      <button type="submit" className="text-sm text-muted underline-offset-4 hover:text-copper hover:underline">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
                <p className="text-sm font-semibold">{formatMoney(item.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <aside className="h-fit rounded-[2rem] border border-line bg-card p-5 lg:sticky lg:top-36">
            <h2 className="font-display text-3xl">Summary</h2>
            <div className="mt-4">
              <QuoteSummary quote={cart.quote} />
            </div>
            <Link
              href={session ? "/checkout" : "/account/login?next=/checkout"}
              className={`${primaryButtonClass} mt-5 w-full`}
            >
              Checkout
            </Link>
            <Link href="/search" className={`${secondaryButtonClass} mt-3 w-full`}>
              Keep shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
