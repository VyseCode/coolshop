import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ledgerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["grant", "purchase", "refund"], required: true },
    amountCents: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    note: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    reference: { type: String, default: "" },
  },
  { timestamps: true },
);

ledgerSchema.index({ userId: 1, createdAt: -1 });
ledgerSchema.index({ orderId: 1, type: 1 });

export type LedgerEntity = InferSchemaType<typeof ledgerSchema> & {
  _id: import("mongoose").Types.ObjectId;
  createdAt?: Date;
};

export const LedgerModel: Model<LedgerEntity> =
  (models.Ledger as Model<LedgerEntity> | undefined) ?? model<LedgerEntity>("Ledger", ledgerSchema);
