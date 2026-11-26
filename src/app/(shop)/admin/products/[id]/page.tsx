import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { updateProductAction } from "@/lib/actions/catalog-admin";
import { requireAdminPage } from "@/lib/auth/admin";
import { getDeskProduct } from "@/lib/services/catalog-admin.service";
import { listCategories } from "@/lib/services/catalog.service";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAdminPage(`/admin/products/${id}`);
  const [product, categories] = await Promise.all([getDeskProduct(session, id), listCategories()]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <Link href="/admin/products" className="text-sm font-medium text-forest hover:underline">
        All products
      </Link>
      <h1 className="mt-3 font-display text-5xl tracking-tight">{product.name}</h1>
      <p className="mt-2 text-sm text-muted">
        Store page: <Link href={`/product/${product.slug}`} className="text-forest hover:underline">/product/{product.slug}</Link>
      </p>
      <div className="mt-6">
        <ProductForm categories={categories} product={product} action={updateProductAction} />
      </div>
    </div>
  );
}
