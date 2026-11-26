import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const returnItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const returnSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    orderNumber: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    email: { type: String, required: true },
    status: { type: String, enum: ["requested", "approved", "rejected"], default: "requested", index: true },
    reason: { type: String, required: true },
    items: { type: [returnItemSchema], required: true },
    refundCents: { type: Number, required: true, min: 0 },
    deskNote: { type: String, default: "" },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

returnSchema.index({ status: 1, createdAt: -1 });

export type ReturnEntity = InferSchemaType<typeof returnSchema> & {
  _id: import("mongoose").Types.ObjectId;
  createdAt?: Date;
};

export const ReturnModel: Model<ReturnEntity> =
  (models.ReturnRequest as Model<ReturnEntity> | undefined) ??
  model<ReturnEntity>("ReturnRequest", returnSchema);
