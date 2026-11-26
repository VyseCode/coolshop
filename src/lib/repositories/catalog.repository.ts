import "server-only";

import { Types } from "mongoose";

import type { CatalogQuery } from "@/domain/catalog-query";
import { slugify } from "@/domain/slug";
import type { AdminProductDTO, CategoryDTO, PageResult, ProductCardDTO, ProductDetailDTO } from "@/domain/types";
import { connectDb } from "@/lib/db/connect";
import { CategoryModel, type CategoryEntity } from "@/lib/db/models/category";
import { ProductModel, type ProductEntity } from "@/lib/db/models/product";

type ProductRecord = ProductEntity & { createdAt?: Date };

function toCard(doc: ProductRecord): ProductCardDTO {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    name: doc.name,
    brand: doc.brand,
    price: doc.price,
    compareAtPrice: doc.compareAtPrice ?? null,
    image: doc.images[0] ?? "",
    rating: doc.rating,
    reviewCount: doc.reviewCount,
    stock: doc.stock,
    categorySlug: doc.categorySlug,
    categoryName: doc.categoryName,
    featured: doc.featured,
  };
}

function toAdmin(doc: ProductRecord): AdminProductDTO {
  return {
    ...toDetail(doc),
    status: doc.status === "archived" ? "archived" : "active",
  };
}

function toDetail(doc: ProductRecord): ProductDetailDTO {
  return {
    ...toCard(doc),
    description: doc.description,
    images: doc.images,
    tags: doc.tags,
    specs: doc.specs.map((spec) => ({ key: spec.key, value: spec.value })),
  };
}

function toCategory(doc: CategoryEntity, productCount?: number): CategoryDTO {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    image: doc.image,
    position: doc.position,
    productCount,
  };
}

export async function listCategories() {
  await connectDb();
  const docs = await CategoryModel.find().sort({ position: 1 }).lean();
  return docs.map((doc) => toCategory(doc));
}

export async function listDepartments() {
  await connectDb();
  const [docs, counts] = await Promise.all([
    CategoryModel.find().sort({ position: 1 }).lean(),
    ProductModel.aggregate<{ _id: string; count: number }>([
      { $match: { status: "active" } },
      { $group: { _id: "$categorySlug", count: { $sum: 1 } } },
    ]),
  ]);
  const countBySlug = new Map(counts.map((row) => [row._id, row.count]));
  return docs.map((doc) => toCategory(doc, countBySlug.get(doc.slug) ?? 0));
}

export async function findCategoryBySlug(slug: string) {
  await connectDb();
  const doc = await CategoryModel.findOne({ slug }).lean();
  return doc ? toCategory(doc) : null;
}

export async function countActiveProducts() {
  await connectDb();
  return ProductModel.countDocuments({ status: "active" });
}

export async function findFeatured(limit: number) {
  await connectDb();
  const docs = await ProductModel.find({ status: "active", featured: true })
    .sort({ rating: -1 })
    .limit(limit)
    .lean();
  return docs.map((doc) => toCard(doc));
}

export async function findNewest(limit: number) {
  await connectDb();
  const docs = await ProductModel.find({ status: "active", featured: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return docs.map((doc) => toCard(doc));
}

export async function findRelated(categorySlug: string, excludeSlug: string, limit = 4) {
  await connectDb();
  const docs = await ProductModel.find({
    status: "active",
    categorySlug,
    slug: { $ne: excludeSlug },
  })
    .sort({ rating: -1 })
    .limit(limit)
    .lean();
  return docs.map((doc) => toCard(doc));
}

export async function findProductBySlug(slug: string) {
  await connectDb();
  const doc = await ProductModel.findOne({ slug, status: "active" }).lean();
  return doc ? toDetail(doc) : null;
}

export async function findProductsBySlugs(slugs: string[]) {
  await connectDb();
  if (slugs.length === 0) return [];
  const docs = await ProductModel.find({ slug: { $in: slugs }, status: "active" }).lean();
  const bySlug = new Map(docs.map((doc) => [doc.slug, toCard(doc)]));
  return slugs.flatMap((slug) => {
    const product = bySlug.get(slug);
    return product ? [product] : [];
  });
}

export async function findProductsByIds(ids: string[]) {
  await connectDb();
  const objectIds = ids.filter((id) => Types.ObjectId.isValid(id));
  const docs = await ProductModel.find({ _id: { $in: objectIds }, status: "active" }).lean();
  return new Map(docs.map((doc) => [doc._id.toString(), toDetail(doc)]));
}

function sortFor(query: CatalogQuery): Record<string, 1 | -1> {
  switch (query.sort) {
    case "newest":
      return { createdAt: -1 };
    case "price-asc":
      return { price: 1 };
    case "price-desc":
      return { price: -1 };
    case "rating":
      return { rating: -1, reviewCount: -1 };
    default:
      return { featured: -1, rating: -1 };
  }
}

export async function searchProducts(query: CatalogQuery): Promise<PageResult<ProductCardDTO>> {
  await connectDb();
  const filter: {
    status: "active";
    categorySlug?: string;
    price?: { $gte?: number; $lte?: number };
    $text?: { $search: string };
  } = { status: "active" };
  if (query.categorySlug) filter.categorySlug = query.categorySlug;
  if (query.minPrice != null || query.maxPrice != null) {
    filter.price = {};
    if (query.minPrice != null) filter.price.$gte = query.minPrice;
    if (query.maxPrice != null) filter.price.$lte = query.maxPrice;
  }

  const useText = query.q.length > 0;
  if (useText) filter.$text = { $search: query.q };

  const skip = (query.page - 1) * query.pageSize;
  const finder = ProductModel.find(filter);
  if (useText && query.sort === "featured") {
    finder.select({ score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
  } else {
    finder.sort(sortFor(query));
  }

  const [docs, total] = await Promise.all([
    finder.skip(skip).limit(query.pageSize).lean(),
    ProductModel.countDocuments(filter),
  ]);

  return {
    items: docs.map((doc) => toCard(doc)),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function decrementStock(productId: string, quantity: number) {
  await connectDb();
  if (!Types.ObjectId.isValid(productId)) return false;
  const updated = await ProductModel.findOneAndUpdate(
    { _id: productId, stock: { $gte: quantity }, status: "active" },
    { $inc: { stock: -quantity } },
  );
  return Boolean(updated);
}

export async function incrementStock(productId: string, quantity: number) {
  await connectDb();
  await ProductModel.updateOne({ _id: productId }, { $inc: { stock: quantity } });
}

export async function listAdminProducts(query: { q: string; page: number; pageSize: number }) {
  await connectDb();
  const filter: { name?: { $regex: string; $options: string } } = {};
  if (query.q) {
    filter.name = { $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }
  const [docs, total] = await Promise.all([
    ProductModel.find(filter)
      .sort({ updatedAt: -1 })
      .skip((query.page - 1) * query.pageSize)
      .limit(query.pageSize)
      .lean(),
    ProductModel.countDocuments(filter),
  ]);
  return {
    items: docs.map((doc) => toAdmin(doc)),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function findAdminProduct(id: string) {
  await connectDb();
  if (!Types.ObjectId.isValid(id)) return null;
  const doc = await ProductModel.findById(id).lean();
  return doc ? toAdmin(doc) : null;
}

async function uniqueSlug(name: string) {
  const base = slugify(name);
  let slug = base;
  let suffix = 2;
  while (await ProductModel.exists({ slug })) {
    slug = `${base.slice(0, 70)}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export type ProductWrite = {
  name: string;
  brand: string;
  description: string;
  categorySlug: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  stock: number;
  featured: boolean;
  tags: string[];
  specs: { key: string; value: string }[];
  status: "active" | "archived";
};

export async function insertProduct(input: ProductWrite) {
  await connectDb();
  const category = await CategoryModel.findOne({ slug: input.categorySlug }).lean();
  if (!category) return null;
  const doc = await ProductModel.create({
    ...input,
    slug: await uniqueSlug(input.name),
    categoryId: category._id,
    categoryName: category.name,
    currency: "USD",
    rating: 0,
    reviewCount: 0,
  });
  const saved = await ProductModel.findById(doc._id).lean();
  return saved ? toAdmin(saved) : null;
}

export async function updateProduct(id: string, input: ProductWrite) {
  await connectDb();
  if (!Types.ObjectId.isValid(id)) return null;
  const category = await CategoryModel.findOne({ slug: input.categorySlug }).lean();
  if (!category) return null;
  const doc = await ProductModel.findByIdAndUpdate(
    id,
    {
      $set: {
        ...input,
        categoryId: category._id,
        categoryName: category.name,
      },
    },
    { returnDocument: "after" },
  ).lean();
  return doc ? toAdmin(doc) : null;
}

export async function listLowStockProducts(threshold = 5, limit = 8) {
  await connectDb();
  const docs = await ProductModel.find({
    status: "active",
    stock: { $lte: threshold },
  })
    .sort({ stock: 1, name: 1 })
    .limit(limit)
    .lean();
  return docs.map((doc) => toCard(doc));
}
