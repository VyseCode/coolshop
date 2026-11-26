import { z } from "zod";

import { COUNTRIES } from "@/domain/pricing";

const countryCodes = COUNTRIES.map((country) => country.code) as [
  (typeof COUNTRIES)[number]["code"],
  ...(typeof COUNTRIES)[number]["code"][],
];

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(60),
  email: z.string().trim().email("Enter a valid email.").max(120),
  password: z.string().min(8, "Use at least 8 characters.").max(72, "Password is too long."),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the recipient name.").max(80),
  line1: z.string().trim().min(4, "Enter a street address.").max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2, "Enter a city.").max(80),
  region: z.string().trim().min(2, "Enter a state or region.").max(80),
  postalCode: z.string().trim().min(3, "Enter a postal code.").max(12),
  country: z.enum(countryCodes, "Choose a country."),
  phone: z.string().trim().min(7, "Enter a phone number.").max(20),
  paymentMethod: z.enum(["wallet", "cod", "demo_card"], "Choose a payment method."),
  couponCode: z.string().trim().max(20).optional(),
});

export const couponFormSchema = z.object({
  code: z.string().trim().min(3, "Use at least 3 characters.").max(20),
  kind: z.enum(["percent", "fixed"]),
  amount: z.string().trim().min(1, "Enter an amount."),
  minSubtotal: z.string().trim().optional(),
  maxUses: z.string().trim().optional(),
  expiresAt: z.string().trim().optional(),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Choose a rating.").max(5),
  title: z.string().trim().max(80).optional(),
  body: z.string().trim().min(12, "Write at least a sentence.").max(600),
});

export const returnRequestSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().trim().min(8, "Tell us a bit more about the return.").max(400),
});

export const returnDecisionSchema = z.object({
  returnId: z.string().min(1),
  deskNote: z.string().trim().max(240).optional(),
});

export const addressSchema = checkoutSchema.pick({
  fullName: true,
  line1: true,
  line2: true,
  city: true,
  region: true,
  postalCode: true,
  country: true,
  phone: true,
});

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name.").max(120),
  brand: z.string().trim().min(2, "Enter a brand.").max(60),
  description: z.string().trim().min(12, "Write a short description.").max(2000),
  categorySlug: z.string().trim().min(1, "Choose a department."),
  price: z.string().trim().min(1, "Enter a price."),
  compareAtPrice: z.string().trim().optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative.").max(100000),
  images: z.string().trim().min(8, "Add at least one https image URL."),
  tags: z.string().trim().max(240).optional(),
  specs: z.string().trim().max(2000).optional(),
  status: z.enum(["active", "archived"], "Choose a status."),
});

function dollarsToCents(value: string, label: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > 100000) {
    return { error: `${label} must be a dollar amount.` };
  }
  return { cents: Math.round(amount * 100) };
}

export function parseProductWrite(input: z.infer<typeof productFormSchema>, featured: boolean) {
  const price = dollarsToCents(input.price, "Price");
  if ("error" in price) return { error: price.error, field: "price" as const };
  let compareAtPrice: number | null = null;
  if (input.compareAtPrice) {
    const compare = dollarsToCents(input.compareAtPrice, "Compare-at price");
    if ("error" in compare) return { error: compare.error, field: "compareAtPrice" as const };
    if (compare.cents <= price.cents) {
      return { error: "Compare-at price must be higher than the price.", field: "compareAtPrice" as const };
    }
    compareAtPrice = compare.cents;
  }
  const images = input.images
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (images.length < 1 || images.length > 6) {
    return { error: "Add between 1 and 6 image URLs.", field: "images" as const };
  }
  for (const image of images) {
    try {
      const url = new URL(image);
      if (url.protocol !== "https:") throw new Error("https");
    } catch {
      return { error: "Image URLs must start with https://", field: "images" as const };
    }
  }
  const specs: { key: string; value: string }[] = [];
  for (const line of (input.specs ?? "").split(/\n+/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const splitAt = trimmed.indexOf(":");
    if (splitAt < 1) return { error: "Write each detail as Key: value.", field: "specs" as const };
    specs.push({ key: trimmed.slice(0, splitAt).trim(), value: trimmed.slice(splitAt + 1).trim() });
  }
  return {
    value: {
      name: input.name,
      brand: input.brand,
      description: input.description,
      categorySlug: input.categorySlug,
      price: price.cents,
      compareAtPrice,
      images,
      stock: input.stock,
      featured,
      tags: (input.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 12),
      specs,
      status: input.status,
    },
  };
}

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(20),
});

export function readForm(formData: FormData) {
  const data: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") data[key] = value;
  }
  return data;
}

export function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}
