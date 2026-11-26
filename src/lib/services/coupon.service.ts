import "server-only";

import { quoteCart } from "@/domain/pricing";
import type { Quote, SessionUser } from "@/domain/types";
import { connectDb } from "@/lib/db/connect";
import { CouponModel } from "@/lib/db/models/coupon";
import { OrderModel } from "@/lib/db/models/order";
import { AppError } from "@/platform/errors";

export type CouponDTO = {
  id: string;
  code: string;
  kind: "percent" | "fixed";
  amount: number;
  minSubtotal: number;
  maxUses: number | null;
  expiresAt: string | null;
  active: boolean;
  uses: number;
};

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

async function usesFor(code: string) {
  return OrderModel.countDocuments({ couponCode: code, status: { $ne: "cancelled" } });
}

export async function priceWithCoupon(subtotal: number, rawCode?: string | null): Promise<Quote> {
  const code = rawCode ? normalizeCode(rawCode) : "";
  if (!code) return quoteCart(subtotal);
  await connectDb();
  const coupon = await CouponModel.findOne({ code }).lean();
  if (!coupon || !coupon.active) throw new AppError("That code is not valid.");
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    throw new AppError("That code has expired.");
  }
  if (subtotal < coupon.minSubtotal) {
    throw new AppError("This order is below the minimum for that code.");
  }
  if (coupon.maxUses != null) {
    const uses = await usesFor(coupon.code);
    if (uses >= coupon.maxUses) throw new AppError("That code has been used up.");
  }
  const discount =
    coupon.kind === "percent"
      ? Math.round((subtotal * coupon.amount) / 100)
      : Math.min(coupon.amount, subtotal);
  return quoteCart(subtotal, discount, coupon.code);
}

export async function listCoupons(user: SessionUser): Promise<CouponDTO[]> {
  if (user.role !== "admin") throw new AppError("Admin only.", 403, "forbidden");
  await connectDb();
  const coupons = await CouponModel.find().sort({ createdAt: -1 }).lean();
  return Promise.all(
    coupons.map(async (coupon) => ({
      id: coupon._id.toString(),
      code: coupon.code,
      kind: coupon.kind as "percent" | "fixed",
      amount: coupon.amount,
      minSubtotal: coupon.minSubtotal ?? 0,
      maxUses: coupon.maxUses ?? null,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
      active: coupon.active,
      uses: await usesFor(coupon.code),
    })),
  );
}

export async function createCoupon(
  user: SessionUser,
  input: {
    code: string;
    kind: "percent" | "fixed";
    amount: number;
    minSubtotal: number;
    maxUses: number | null;
    expiresAt: Date | null;
  },
) {
  if (user.role !== "admin") throw new AppError("Admin only.", 403, "forbidden");
  if (input.kind === "percent" && (input.amount < 1 || input.amount > 90)) {
    throw new AppError("Percent off must be between 1 and 90.");
  }
  await connectDb();
  try {
    const coupon = await CouponModel.create({
      code: normalizeCode(input.code),
      kind: input.kind,
      amount: input.amount,
      minSubtotal: input.minSubtotal,
      maxUses: input.maxUses,
      expiresAt: input.expiresAt,
      active: true,
    });
    return coupon.code;
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      throw new AppError("That code already exists.", 409, "duplicate");
    }
    throw error;
  }
}
