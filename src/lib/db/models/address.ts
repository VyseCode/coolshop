import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const addressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, default: "Address", trim: true },
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    city: { type: String, required: true },
    region: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

addressSchema.index({ userId: 1, isDefault: -1, updatedAt: -1 });

export type AddressEntity = InferSchemaType<typeof addressSchema> & {
  _id: import("mongoose").Types.ObjectId;
};

export const AddressModel: Model<AddressEntity> =
  (models.Address as Model<AddressEntity> | undefined) ?? model<AddressEntity>("Address", addressSchema);
