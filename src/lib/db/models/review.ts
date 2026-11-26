import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "" },
    body: { type: String, required: true },
  },
  { timestamps: true },
);

reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export type ReviewEntity = InferSchemaType<typeof reviewSchema> & {
  _id: import("mongoose").Types.ObjectId;
  createdAt?: Date;
};

export const ReviewModel: Model<ReviewEntity> =
  (models.Review as Model<ReviewEntity> | undefined) ?? model<ReviewEntity>("Review", reviewSchema);
