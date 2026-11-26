import "server-only";

import { cookies } from "next/headers";

import { findProductsBySlugs } from "@/lib/repositories/catalog.repository";

const RECENT_COOKIE = "cs_recent";
const RECENT_LIMIT = 8;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export async function readRecentSlugs() {
  const raw = (await cookies()).get(RECENT_COOKIE)?.value ?? "";
  return raw
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, RECENT_LIMIT);
}

export async function rememberRecentSlug(slug: string) {
  const current = await readRecentSlugs();
  const next = [slug, ...current.filter((item) => item !== slug)].slice(0, RECENT_LIMIT);
  (await cookies()).set(RECENT_COOKIE, next.join(","), cookieOptions());
}

export async function getRecentProducts(excludeSlug?: string) {
  const slugs = (await readRecentSlugs()).filter((slug) => slug !== excludeSlug);
  return findProductsBySlugs(slugs);
}
