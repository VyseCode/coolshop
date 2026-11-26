import mongoose, { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    walletCents: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

export type UserEntity = InferSchemaType<typeof userSchema> & { _id: import("mongoose").Types.ObjectId };

if (process.env.NODE_ENV !== "production" && models.User) {
  mongoose.deleteModel("User");
}

export const UserModel: Model<UserEntity> =
  (models.User as Model<UserEntity> | undefined) ?? model<UserEntity>("User", userSchema);
