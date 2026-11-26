import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    kind: { type: String, enum: ["percent", "fixed"], required: true },
    amount: { type: Number, required: true, min: 1 },
    minSubtotal: { type: Number, default: 0, min: 0 },
    maxUses: { type: Number, default: null },
    expiresAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type CouponEntity = InferSchemaType<typeof couponSchema> & {
  _id: import("mongoose").Types.ObjectId;
};

export const CouponModel: Model<CouponEntity> =
  (models.Coupon as Model<CouponEntity> | undefined) ?? model<CouponEntity>("Coupon", couponSchema);
