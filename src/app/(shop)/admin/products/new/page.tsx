import type { Metadata } from "next";
import Link from "next/link";

import { ProductForm } from "@/components/admin/product-form";
import { createProductAction } from "@/lib/actions/catalog-admin";
import { requireAdminPage } from "@/lib/auth/admin";
import { listCategories } from "@/lib/services/catalog.service";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdminPage("/admin/products/new");
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <Link href="/admin/products" className="text-sm font-medium text-forest hover:underline">
        All products
      </Link>
      <h1 className="mt-3 font-display text-5xl tracking-tight">New product</h1>
      <div className="mt-6">
        <ProductForm categories={categories} action={createProductAction} />
      </div>
    </div>
  );
}
