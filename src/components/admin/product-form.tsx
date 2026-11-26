"use client";

import { useActionState } from "react";

import { formatMoney } from "@/domain/format";
import type { AdminProductDTO, CategoryDTO, FormState } from "@/domain/types";
import { inputClass, primaryButtonClass } from "@/components/ui/classes";

export function ProductForm({
  categories,
  product,
  action,
}: {
  categories: CategoryDTO[];
  product?: AdminProductDTO;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, null as FormState);
  const errors = state?.fieldErrors;

  return (
    <form action={formAction} className="grid gap-4 rounded-[2rem] border border-line bg-card p-5 sm:p-7">
      {product ? <input type="hidden" name="productId" value={product.id} /> : null}
      <label className="block text-sm">
        <span className="font-medium">Name</span>
        <input name="name" required defaultValue={product?.name} className={`${inputClass} mt-1.5`} />
        {errors?.name ? <span className="mt-1 block text-copper">{errors.name}</span> : null}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Brand</span>
          <input name="brand" required defaultValue={product?.brand} className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Department</span>
          <select name="categorySlug" defaultValue={product?.categorySlug ?? categories[0]?.slug} className={`${inputClass} mt-1.5`}>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Price (USD)</span>
          <input name="price" required inputMode="decimal" defaultValue={product ? (product.price / 100).toFixed(2) : ""} className={`${inputClass} mt-1.5`} />
          {errors?.price ? <span className="mt-1 block text-copper">{errors.price}</span> : null}
        </label>
        <label className="block text-sm">
          <span className="font-medium">Compare-at price</span>
          <input
            name="compareAtPrice"
            inputMode="decimal"
            placeholder="Optional"
            defaultValue={product?.compareAtPrice ? (product.compareAtPrice / 100).toFixed(2) : ""}
            className={`${inputClass} mt-1.5`}
          />
          {errors?.compareAtPrice ? <span className="mt-1 block text-copper">{errors.compareAtPrice}</span> : null}
        </label>
        <label className="block text-sm">
          <span className="font-medium">Stock</span>
          <input name="stock" required type="number" min={0} defaultValue={product?.stock ?? 0} className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Status</span>
          <select name="status" defaultValue={product?.status ?? "active"} className={`${inputClass} mt-1.5`}>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" value="on" defaultChecked={product?.featured} />
        Feature on the home page
      </label>
      <label className="block text-sm">
        <span className="font-medium">Description</span>
        <textarea name="description" required rows={4} defaultValue={product?.description} className={`${inputClass} mt-1.5`} />
        {errors?.description ? <span className="mt-1 block text-copper">{errors.description}</span> : null}
      </label>
      <label className="block text-sm">
        <span className="font-medium">Image URLs</span>
        <textarea
          name="images"
          required
          rows={3}
          defaultValue={product?.images.join("\n")}
          placeholder="https://images.unsplash.com/..."
          className={`${inputClass} mt-1.5`}
        />
        {errors?.images ? <span className="mt-1 block text-copper">{errors.images}</span> : null}
        <span className="mt-1 block text-xs text-muted">One https URL per line, up to 6. Unsplash photos are optimized.</span>
      </label>
      <label className="block text-sm">
        <span className="font-medium">Tags</span>
        <input name="tags" defaultValue={product?.tags.join(", ")} placeholder="lamp, ceramic" className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Details</span>
        <textarea
          name="specs"
          rows={4}
          defaultValue={product?.specs.map((spec) => `${spec.key}: ${spec.value}`).join("\n")}
          placeholder={"Height: 42 cm\nShade: Linen"}
          className={`${inputClass} mt-1.5`}
        />
        {errors?.specs ? <span className="mt-1 block text-copper">{errors.specs}</span> : null}
      </label>
      {product ? <p className="text-sm text-muted">Current price on the store: {formatMoney(product.price)}. The link stays /product/{product.slug}.</p> : null}
      {state?.error ? <p className="text-sm text-copper">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-forest">Saved.</p> : null}
      <button className={`${primaryButtonClass} w-fit`} disabled={pending}>
        {pending ? "Saving…" : product ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
