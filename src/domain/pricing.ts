import type { Quote } from "@/domain/types";

/** Flat rules for v1. Swap this module for a carrier and tax provider later. */
export const FREE_SHIPPING_CENTS = 5000;
export const FLAT_SHIPPING_CENTS = 599;
export const TAX_RATE = 0.08;

export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "IN", name: "India" },
  { code: "AU", name: "Australia" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

export function quoteCart(subtotal: number, discountCents = 0, couponCode: string | null = null): Quote {
  const discount = Math.min(Math.max(0, discountCents), subtotal);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_CENTS ? 0 : FLAT_SHIPPING_CENTS;
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  return {
    subtotal,
    discount,
    couponCode,
    shipping,
    tax,
    total: subtotal - discount + shipping + tax,
  };
}

export function countryName(code: string) {
  return COUNTRIES.find((country) => country.code === code)?.name ?? code;
}
