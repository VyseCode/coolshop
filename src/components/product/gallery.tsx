"use client";

import { useState } from "react";

import { ProductImage } from "@/components/product/product-image";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-sand">
        {current ? (
          <ProductImage
            src={current}
            alt={name}
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>
      {images.length > 1 ? (
        <ul className="mt-3 flex gap-2">
          {images.map((src, index) => (
            <li key={`${src}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${name}`}
                className={`relative size-16 overflow-hidden rounded-2xl border ${
                  index === active ? "border-forest" : "border-line"
                }`}
              >
                <ProductImage src={src} alt="" sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
