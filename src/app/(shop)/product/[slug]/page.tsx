import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDate } from "@/domain/format";
import { AddToCart } from "@/components/product/add-to-cart";
import { Gallery } from "@/components/product/gallery";
import { Price } from "@/components/product/price";
import { ProductCard } from "@/components/product/product-card";
import { RecordView } from "@/components/product/record-view";
import { ReviewForm } from "@/components/product/review-form";
import { Stars } from "@/components/product/stars";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { getSession } from "@/lib/auth/session";
import { live } from "@/lib/live";
import { getRecentProducts } from "@/lib/recent";
import { getProduct, getRelatedProducts } from "@/lib/services/catalog.service";
import { getOftenBoughtWith } from "@/lib/services/discovery.service";
import { getProductReviews, getReviewAccess } from "@/lib/services/review.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await live();
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product" };
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await live();
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const session = await getSession();
  const [related, reviews, access, boughtWith, recent] = await Promise.all([
    getRelatedProducts(product.categorySlug, product.slug),
    getProductReviews(product.id),
    getReviewAccess(session, product.id),
    getOftenBoughtWith(product.id),
    getRecentProducts(product.slug),
  ]);
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (product.price / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  }).replace(/</g, "\\u003c");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <RecordView slug={product.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-ink">Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/c/${product.categorySlug}`} className="hover:text-ink">{product.categoryName}</Link></li>
          <li aria-hidden>/</li>
          <li className="text-ink">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <Gallery images={product.images} name={product.name} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{product.brand}</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">{product.name}</h1>
          <div className="mt-3">
            <Stars value={product.rating} count={product.reviewCount} />
            {reviews.length === 0 ? (
              <p className="mt-1 text-xs text-muted">Sample catalog rating until a customer reviews it.</p>
            ) : null}
          </div>
          <div className="mt-5">
            <Price price={product.price} compareAt={product.compareAtPrice} size="lg" />
          </div>
          <p className="mt-5 max-w-prose leading-7 text-muted">{product.description}</p>
          <p className="mt-4 text-sm font-medium">
            {product.stock < 1
              ? "Out of stock"
              : product.stock < 8
                ? `Only ${product.stock} left`
                : "In stock"}
          </p>
          <AddToCart productId={product.id} stock={product.stock} />
          <div className="mt-3">
            <WishlistButton productId={product.id} variant="text" />
          </div>
          <p className="mt-4 text-sm text-muted">Ships from the local demo warehouse. Free shipping over $50.</p>
        </div>
      </div>

      {product.specs.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-display text-3xl">Details</h2>
          <dl className="mt-4 divide-y divide-line rounded-3xl border border-line bg-card">
            {product.specs.map((spec) => (
              <div key={spec.key} className="grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr]">
                <dt className="text-sm text-muted">{spec.key}</dt>
                <dd className="text-sm">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="mt-14">
        <h2 className="font-display text-3xl">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-muted">No customer reviews yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-3xl border border-line bg-card p-5">
                <Stars value={review.rating} />
                {review.title ? <h3 className="mt-2 font-medium">{review.title}</h3> : null}
                <p className="mt-2 text-sm leading-6">{review.body}</p>
                <p className="mt-3 text-xs text-muted">
                  {review.authorName} · {formatDate(review.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
        {access.mine ? (
          <p className="mt-6 text-sm text-forest">You already reviewed this item.</p>
        ) : access.purchased ? (
          <ReviewForm productId={product.id} />
        ) : (
          <p className="mt-6 text-sm text-muted">
            {session ? (
              "Buy this item to leave a review. Cancelled orders do not count."
            ) : (
              <>
                <Link href={`/account/login?next=/product/${product.slug}`} className="font-medium text-forest hover:underline">
                  Sign in
                </Link>{" "}
                and buy this item to review it.
              </>
            )}
          </p>
        )}
      </section>

      {boughtWith.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-display text-3xl">Often bought with</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {boughtWith.map((item) => (
              <li key={item.id}>
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-display text-3xl">Recently viewed</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {recent.map((item) => (
              <li key={item.id}>
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-display text-3xl">More in {product.categoryName}</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.id}>
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
