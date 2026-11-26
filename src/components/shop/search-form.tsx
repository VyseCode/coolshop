"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function SearchForm({ id }: { id: string }) {
  const params = useSearchParams();
  const query = params.get("q") ?? "";

  return (
    <form action="/search" className="relative min-w-0 flex-1">
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        key={query}
        id={id}
        name="q"
        defaultValue={query}
        placeholder="Search CoolShop"
        className="w-full rounded-full border border-white/10 bg-white py-2.5 pl-4 pr-12 text-sm text-ink outline-none placeholder:text-muted"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1 top-1 grid size-8 place-items-center rounded-full bg-forest text-white"
      >
        <Search className="size-4" />
      </button>
    </form>
  );
}
