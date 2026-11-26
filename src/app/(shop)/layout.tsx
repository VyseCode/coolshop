import { ShopFooter } from "@/components/shop/footer";
import { ShopHeader } from "@/components/shop/header";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";
import { getSession } from "@/lib/auth/session";
import { live } from "@/lib/live";
import { getWishlistIds } from "@/lib/services/wishlist.service";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  await live();
  const session = await getSession();
  const savedIds = session ? await getWishlistIds(session.id) : [];
  return (
    <WishlistProvider key={savedIds.join(",")} initialIds={savedIds} signedIn={Boolean(session)}>
      <ShopHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <ShopFooter />
    </WishlistProvider>
  );
}
