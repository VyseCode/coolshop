import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const specSchema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    categorySlug: { type: String, required: true },
    categoryName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null },
    currency: { type: String, default: "USD" },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    specs: { type: [specSchema], default: [] },
    status: { type: String, enum: ["active", "archived"], default: "active", index: true },
  },
  { timestamps: true },
);

productSchema.index(
  { name: "text", brand: "text", description: "text", tags: "text" },
  { weights: { name: 10, brand: 6, tags: 4, description: 1 }, name: "product_text" },
);
productSchema.index({ categorySlug: 1, price: 1 });
productSchema.index({ featured: -1, rating: -1 });
productSchema.index({ createdAt: -1 });

export type ProductEntity = InferSchemaType<typeof productSchema> & {
  _id: import("mongoose").Types.ObjectId;
  createdAt?: Date;
};

export const ProductModel: Model<ProductEntity> =
  (models.Product as Model<ProductEntity> | undefined) ??
  model<ProductEntity>("Product", productSchema);
