"use client";

import { primaryButtonClass } from "@/components/ui/classes";

export default function ShopError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">CoolShop</p>
      <h1 className="mt-3 font-display text-5xl">Something went wrong</h1>
      <p className="mt-3 text-muted">Make sure MongoDB is running locally, then try the page again.</p>
      <button type="button" onClick={reset} className={`${primaryButtonClass} mt-6`}>
        Try again
      </button>
    </div>
  );
}
