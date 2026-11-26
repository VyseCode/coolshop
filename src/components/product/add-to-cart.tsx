"use client";

import { useActionState } from "react";
import Link from "next/link";

import type { FormState } from "@/domain/types";
import { addToCartAction } from "@/lib/actions/cart";
import { primaryButtonClass } from "@/components/ui/classes";

export function AddToCart({ productId, stock }: { productId: string; stock: number }) {
  const [state, action, pending] = useActionState(addToCartAction, null as FormState);
  const max = Math.min(stock, 20);

  return (
    <form action={action} className="mt-6 space-y-3">
      <input type="hidden" name="productId" value={productId} />
      <label className="block text-sm font-medium" htmlFor="quantity">
        Quantity
      </label>
      <input
        id="quantity"
        name="quantity"
        type="number"
        min={1}
        max={max}
        defaultValue={1}
        disabled={stock < 1}
        className="w-24 rounded-2xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-forest focus:ring-4 focus:ring-forest/10"
      />
      <button type="submit" className={`${primaryButtonClass} w-full sm:w-auto`} disabled={pending || stock < 1}>
        {stock < 1 ? "Out of stock" : pending ? "Adding…" : "Add to bag"}
      </button>
      {state?.error ? (
        <p className="text-sm text-copper" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-forest">
          Added to your bag.{" "}
          <Link href="/cart" className="font-semibold underline-offset-4 hover:underline">
            View bag
          </Link>
        </p>
      ) : null}
    </form>
  );
}
