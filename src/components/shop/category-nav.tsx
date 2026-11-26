"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function CategoryNav({ categories }: { categories: { name: string; slug: string }[] }) {
  const pathname = usePathname();
  const shopAll = pathname === "/search";

  return (
    <nav aria-label="Departments" className="no-scrollbar flex gap-1 overflow-x-auto">
      <Link
        href="/search"
        className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${shopAll ? "bg-forest text-white" : "text-ink/80 hover:bg-white"}`}
      >
        All
      </Link>
      {categories.map((category) => {
        const href = `/c/${category.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={category.slug}
            href={href}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${active ? "bg-forest text-white" : "text-ink/80 hover:bg-white"}`}
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}
