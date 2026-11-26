import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, max: 20 },
  },
  { _id: false },
);

const cartSchema = new Schema(
  {
    ownerKey: { type: String, required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true },
);

export type CartEntity = InferSchemaType<typeof cartSchema> & {
  _id: import("mongoose").Types.ObjectId;
};

export const CartModel: Model<CartEntity> =
  (models.Cart as Model<CartEntity> | undefined) ?? model<CartEntity>("Cart", cartSchema);
