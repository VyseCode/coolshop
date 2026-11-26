import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    position: { type: Number, required: true, index: true },
  },
  { timestamps: true },
);

export type CategoryEntity = InferSchemaType<typeof categorySchema> & {
  _id: import("mongoose").Types.ObjectId;
};

export const CategoryModel: Model<CategoryEntity> =
  (models.Category as Model<CategoryEntity> | undefined) ??
  model<CategoryEntity>("Category", categorySchema);
