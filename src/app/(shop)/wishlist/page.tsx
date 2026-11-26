import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProductCard } from "@/components/product/product-card";
import { primaryButtonClass } from "@/components/ui/classes";
import { getSession } from "@/lib/auth/session";
import { getWishlist } from "@/lib/services/wishlist.service";

export const metadata: Metadata = { title: "Saved" };

export default async function WishlistPage() {
  const session = await getSession();
  if (!session) redirect("/account/login?next=/wishlist");
  const products = await getWishlist(session.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-5xl tracking-tight">Saved</h1>
      <p className="mt-2 text-muted">Products you want to come back to.</p>
      {products.length === 0 ? (
        <div className="mt-8 max-w-xl rounded-[2rem] border border-dashed border-line bg-card px-6 py-16">
          <p>Nothing saved yet.</p>
          <Link href="/search" className={`${primaryButtonClass} mt-5`}>
            Browse the catalog
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
