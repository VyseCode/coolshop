import mongoose, { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const addressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    city: { type: String, required: true },
    region: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false },
);

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    email: { type: String, required: true },
    shippingAddress: { type: addressSchema, required: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    shipping: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["wallet", "cod", "demo_card"], required: true },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "demo_authorized", "captured", "refunded", "partially_refunded"],
      required: true,
    },
    refundedCents: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["placed", "paid", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true },
);

orderSchema.index({ userId: 1, createdAt: -1 });

export type OrderEntity = InferSchemaType<typeof orderSchema> & {
  _id: import("mongoose").Types.ObjectId;
  createdAt?: Date;
};

if (process.env.NODE_ENV !== "production" && models.Order) {
  mongoose.deleteModel("Order");
}

export const OrderModel: Model<OrderEntity> =
  (models.Order as Model<OrderEntity> | undefined) ?? model<OrderEntity>("Order", orderSchema);
