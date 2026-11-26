"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useWishlist } from "@/components/wishlist/wishlist-provider";

export function WishlistButton({
  productId,
  variant = "icon",
}: {
  productId: string;
  variant?: "icon" | "text";
}) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(productId);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    const message = await toggle(productId);
    setError(message);
    setPending(false);
  }

  if (variant === "text") {
    return (
      <div>
        <button
          type="button"
          onClick={onClick}
          disabled={pending}
          className="inline-flex items-center gap-2 text-sm font-medium text-forest disabled:opacity-50"
        >
          <Heart className={`size-4 ${saved ? "fill-copper text-copper" : ""}`} />
          {saved ? "Saved" : "Save"}
        </button>
        {error ? <p className="mt-1 text-sm text-copper">{error}</p> : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-white/95 text-ink shadow-sm transition hover:bg-white disabled:opacity-60"
    >
      <Heart className={`size-4 ${saved ? "fill-copper text-copper" : ""}`} />
    </button>
  );
}

export function WishlistNavLink() {
  const { signedIn, count } = useWishlist();
  if (!signedIn) return null;
  return (
    <Link href="/wishlist" className="relative inline-flex items-center gap-2 rounded-full px-2.5 py-2 hover:bg-white/10">
      <Heart className={`size-4 ${count > 0 ? "fill-current" : ""}`} />
      <span className="hidden lg:inline">Saved</span>
      {count > 0 ? (
        <span className="grid min-w-5 place-items-center rounded-full bg-copper px-1.5 text-[11px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
