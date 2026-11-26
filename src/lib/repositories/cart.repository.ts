import "server-only";

import { Types } from "mongoose";

import { connectDb } from "@/lib/db/connect";
import { CartModel } from "@/lib/db/models/cart";

export type StoredCartItem = { productId: string; quantity: number };

export async function readCart(ownerKey: string): Promise<StoredCartItem[]> {
  await connectDb();
  const cart = await CartModel.findOne({ ownerKey }).lean();
  if (!cart) return [];
  return cart.items.map((item) => ({
    productId: item.productId.toString(),
    quantity: item.quantity,
  }));
}

export async function writeCart(ownerKey: string, items: StoredCartItem[]) {
  await connectDb();
  await CartModel.updateOne(
    { ownerKey },
    {
      $set: {
        items: items.map((item) => ({
          productId: new Types.ObjectId(item.productId),
          quantity: item.quantity,
        })),
      },
    },
    { upsert: true },
  );
}

export async function deleteCart(ownerKey: string) {
  await connectDb();
  await CartModel.deleteOne({ ownerKey });
}
