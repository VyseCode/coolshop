import Link from "next/link";

import { primaryButtonClass } from "@/components/ui/classes";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">404</p>
      <h1 className="mt-3 font-display text-5xl">We could not find that</h1>
      <p className="mt-3 text-muted">The page or product may have moved. The catalog is still open.</p>
      <Link href="/search" className={`${primaryButtonClass} mt-6`}>
        Browse the catalog
      </Link>
    </div>
  );
}
