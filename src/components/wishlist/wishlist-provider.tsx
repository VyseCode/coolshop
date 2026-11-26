"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { toggleWishlistAction } from "@/lib/actions/wishlist";

type WishlistContextValue = {
  signedIn: boolean;
  count: number;
  isSaved: (productId: string) => boolean;
  toggle: (productId: string) => Promise<string | null>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({
  initialIds,
  signedIn,
  children,
}: {
  initialIds: string[];
  signedIn: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ids, setIds] = useState(() => new Set(initialIds));

  const value = useMemo<WishlistContextValue>(
    () => ({
      signedIn,
      count: ids.size,
      isSaved: (productId) => ids.has(productId),
      toggle: async (productId) => {
        if (!signedIn) {
          router.push(`/account/login?next=${encodeURIComponent(pathname || "/")}`);
          return null;
        }
        const result = await toggleWishlistAction(productId);
        if (!result.ok) return result.error;
        setIds((current) => {
          const next = new Set(current);
          if (result.saved) next.add(productId);
          else next.delete(productId);
          return next;
        });
        router.refresh();
        return null;
      },
    }),
    [ids, pathname, router, signedIn],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const value = useContext(WishlistContext);
  if (!value) {
    throw new Error("Wishlist controls must sit inside the shop layout.");
  }
  return value;
}
