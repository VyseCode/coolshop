"use client";

import { useActionState } from "react";

import type { FormState } from "@/domain/types";
import { createReviewAction } from "@/lib/actions/review";
import { inputClass, primaryButtonClass } from "@/components/ui/classes";

export function ReviewForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState(createReviewAction, null as FormState);

  return (
    <form action={action} className="mt-6 max-w-xl space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <fieldset>
        <legend className="text-sm font-medium">Your rating</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[5, 4, 3, 2, 1].map((score) => (
            <label key={score} className="cursor-pointer rounded-full border border-line bg-white px-3 py-1.5 text-sm has-[:checked]:border-forest has-[:checked]:bg-mint">
              <input className="sr-only" type="radio" name="rating" value={score} required={score === 5} />
              {score} {score === 1 ? "star" : "stars"}
            </label>
          ))}
        </div>
        {state?.fieldErrors?.rating ? <p className="mt-1 text-sm text-copper">{state.fieldErrors.rating}</p> : null}
      </fieldset>
      <label className="block text-sm">
        <span className="font-medium">Title</span>
        <input name="title" maxLength={80} className={`${inputClass} mt-1.5`} placeholder="Optional" />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Review</span>
        <textarea name="body" required minLength={12} maxLength={600} rows={4} className={`${inputClass} mt-1.5`} />
        {state?.fieldErrors?.body ? <span className="mt-1 block text-copper">{state.fieldErrors.body}</span> : null}
      </label>
      {state?.error ? (
        <p className="text-sm text-copper" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? <p className="text-sm text-forest">Thanks. Your review is on the product.</p> : null}
      <button className={primaryButtonClass} disabled={pending}>
        {pending ? "Saving…" : "Publish review"}
      </button>
    </form>
  );
}
