import { Types } from "mongoose";

import { ProductModel } from "@/lib/db/models/product";
import { ReviewModel } from "@/lib/db/models/review";

export async function refreshProductRating(productId: string) {
  if (!Types.ObjectId.isValid(productId)) return { rating: 0, reviewCount: 0 };
  const [row] = await ReviewModel.aggregate<{ avg: number; count: number }>([
    { $match: { productId: new Types.ObjectId(productId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const reviewCount = row?.count ?? 0;
  const rating = reviewCount ? Math.round(row.avg * 10) / 10 : 0;
  await ProductModel.updateOne({ _id: productId }, { $set: { rating, reviewCount } });
  return { rating, reviewCount };
}
