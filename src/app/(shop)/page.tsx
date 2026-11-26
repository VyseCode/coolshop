import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatMoney } from "@/domain/format";
import { FREE_SHIPPING_CENTS } from "@/domain/pricing";
import { ProductCard } from "@/components/product/product-card";
import { Price } from "@/components/product/price";
import { primaryButtonClass, secondaryButtonClass } from "@/components/ui/classes";
import { getRecentProducts } from "@/lib/recent";
import { getHomeCatalog } from "@/lib/services/catalog.service";

export default async function HomePage() {
  const [{ departments, featured, newest, total }, recent] = await Promise.all([
    getHomeCatalog(),
    getRecentProducts(),
  ]);
  const hero = featured[0];

  if (total === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-5xl">The catalog is empty</h1>
        <p className="mt-4 text-muted">
          Start MongoDB, then run <code className="rounded bg-sand px-1.5 py-0.5">npm run seed</code> to load the sample departments.
        </p>
      </section>
    );
  }

  return (
    <div>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-6 lg:py-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">Everyday marketplace</p>
          <h1 className="mt-3 max-w-xl font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Shop the everyday, without the noise.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-muted">
            Electronics, home, style, and the small things you replace often. One catalog, built so new departments can land without a rewrite.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/search" className={primaryButtonClass}>
              Shop the catalog
            </Link>
            <Link href="/c/electronics" className={secondaryButtonClass}>
              Explore electronics
            </Link>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Pieces</dt>
              <dd className="mt-1 font-display text-3xl">{total}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Departments</dt>
              <dd className="mt-1 font-display text-3xl">{departments.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Free ship</dt>
              <dd className="mt-1 font-display text-3xl">{formatMoney(FREE_SHIPPING_CENTS).replace(".00", "")}</dd>
            </div>
          </dl>
        </div>
        {hero ? (
          <Link
            href={`/product/${hero.slug}`}
            className="group relative overflow-hidden rounded-[2rem] bg-sand shadow-[0_30px_80px_-40px_rgba(20,33,28,0.7)]"
          >
            <div className="relative aspect-[4/5] sm:aspect-[5/4]">
              {hero.image ? (
                <Image
                  src={hero.image}
                  alt={hero.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                />
              ) : null}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-6 text-white">
                <p className="text-xs uppercase tracking-[0.16em] text-white/75">{hero.brand}</p>
                <p className="mt-1 font-display text-4xl">{hero.name}</p>
                <div className="mt-2 text-white [&_span]:text-white/75">
                  <Price price={hero.price} compareAt={hero.compareAtPrice} />
                </div>
              </div>
            </div>
          </Link>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-4xl">Departments</h2>
          <Link href="/search" className="text-sm font-medium text-forest hover:underline">
            View all
          </Link>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((department, index) => (
            <li key={department.slug} className={index === 0 ? "sm:col-span-2 lg:row-span-2" : ""}>
              <Link href={`/c/${department.slug}`} className="group relative block h-full min-h-52 overflow-hidden rounded-[1.7rem]">
                <Image
                  src={department.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
                <span className="absolute bottom-0 p-5 text-white">
                  <span className={`block font-display ${index === 0 ? "text-4xl" : "text-2xl"}`}>{department.name}</span>
                  <span className="mt-1 block text-sm text-white/80">
                    {department.productCount ?? 0} products
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <h2 className="font-display text-4xl">Featured this week</h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {featured.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 lg:px-6">
        {[
          { icon: Truck, title: "Free shipping over $50", copy: "A flat $5.99 before that. Tax is estimated at checkout." },
          { icon: RotateCcw, title: "A bag that stays with you", copy: "Shop as a guest. Sign in and the same bag is waiting at checkout." },
          { icon: ShieldCheck, title: "CoolCash for testing", copy: "Spend the test balance at checkout. 1 CC equals $1, and a real card can replace it later." },
        ].map((item) => (
          <article key={item.title} className="rounded-3xl border border-line bg-card p-5">
            <item.icon className="size-5 text-forest" />
            <h3 className="mt-4 font-medium">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{item.copy}</p>
          </article>
        ))}
      </section>

      {recent.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pt-16 lg:px-6">
          <h2 className="font-display text-4xl">Recently viewed</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {recent.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <h2 className="font-display text-4xl">Just arrived</h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {newest.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
