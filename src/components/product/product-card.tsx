import Link from "next/link";

import { discountPercent } from "@/domain/format";
import type { ProductCardDTO } from "@/domain/types";
import { Price } from "@/components/product/price";
import { ProductImage } from "@/components/product/product-image";
import { Stars } from "@/components/product/stars";
import { WishlistButton } from "@/components/wishlist/wishlist-button";

export function ProductCard({ product }: { product: ProductCardDTO }) {
  const off = discountPercent(product.price, product.compareAtPrice);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-32px_rgba(20,33,28,0.55)]">
      <div className="relative">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-sand">
        {product.image ? (
          <ProductImage
            src={product.image}
            alt={product.name}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : null}
        {off ? (
          <span className="absolute left-3 top-3 rounded-full bg-copper px-2.5 py-1 text-[11px] font-semibold text-white">
            {off}% off
          </span>
        ) : null}
      </Link>
      <WishlistButton productId={product.id} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{product.brand}</p>
        <h3 className="mt-1 line-clamp-2 font-medium leading-snug">
          <Link href={`/product/${product.slug}`} className="hover:text-forest">
            {product.name}
          </Link>
        </h3>
        <div className="mt-2">
          <Stars value={product.rating} count={product.reviewCount} />
        </div>
        <div className="mt-auto pt-3">
          <Price price={product.price} compareAt={product.compareAtPrice} />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: ProductCardDTO[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
