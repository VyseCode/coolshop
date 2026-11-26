import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const wishlistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true },
);

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });
wishlistSchema.index({ userId: 1, createdAt: -1 });

export type WishlistEntity = InferSchemaType<typeof wishlistSchema> & {
  _id: import("mongoose").Types.ObjectId;
  createdAt?: Date;
};

export const WishlistModel: Model<WishlistEntity> =
  (models.Wishlist as Model<WishlistEntity> | undefined) ??
  model<WishlistEntity>("Wishlist", wishlistSchema);
