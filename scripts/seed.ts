import { randomBytes } from "node:crypto";

import { adminAccount, coolCash, demoAccount } from "../src/config/site";
import { quoteCart } from "../src/domain/pricing";
import { categorySeeds, productSeeds } from "../src/data/catalog";
import { reviewSeeds, sampleReviewers } from "../src/data/reviews";
import { hashPassword } from "../src/lib/auth/password";
import { connectDb, disconnectDb } from "../src/lib/db/connect";
import { refreshProductRating } from "../src/lib/db/refresh-rating";
import { AddressModel } from "../src/lib/db/models/address";
import { CouponModel } from "../src/lib/db/models/coupon";
import { CartModel } from "../src/lib/db/models/cart";
import { OrderModel } from "../src/lib/db/models/order";
import { CategoryModel } from "../src/lib/db/models/category";
import { LedgerModel } from "../src/lib/db/models/ledger";
import { ProductModel } from "../src/lib/db/models/product";
import { ReviewModel } from "../src/lib/db/models/review";
import { UserModel } from "../src/lib/db/models/user";
import { ReturnModel } from "../src/lib/db/models/return";
import { WishlistModel } from "../src/lib/db/models/wishlist";

async function seedAccount(input: {
  email: string;
  name: string;
  password: string;
  role: "customer" | "admin";
  walletCents: number;
  note: string;
}) {
  const passwordHash = await hashPassword(input.password);
  const user = await UserModel.findOneAndUpdate(
    { email: input.email },
    {
      $set: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
        walletCents: input.walletCents,
      },
    },
    { upsert: true, returnDocument: "after" },
  );
  await LedgerModel.deleteMany({ userId: user._id });
  if (input.walletCents > 0) {
    await LedgerModel.create({
      userId: user._id,
      type: "grant",
      amountCents: input.walletCents,
      balanceAfter: input.walletCents,
      note: input.note,
    });
  }
  return { id: user._id.toString() };
}

async function seedSampleHistory(userId: string) {
  const slugs = [
    "harbor-studio-headphones",
    "kite-portable-speaker",
    "atelier-mechanical-keyboard",
    "lumen-pocket-phone",
    "mare-ceramic-lamp",
    "sunday-linen-throw",
    "brume-pour-over-kettle",
  ];
  const products = await ProductModel.find({ slug: { $in: slugs } }).lean();
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const groups = [
    ["harbor-studio-headphones", "kite-portable-speaker", "atelier-mechanical-keyboard"],
    ["harbor-studio-headphones", "lumen-pocket-phone"],
    ["mare-ceramic-lamp", "sunday-linen-throw", "brume-pour-over-kettle"],
  ];
  for (const [index, group] of groups.entries()) {
    const items = group.map((slug) => {
      const product = bySlug.get(slug);
      if (!product) throw new Error(`Missing sample product ${slug}`);
      return {
        productId: product._id,
        slug: product.slug,
        name: product.name,
        image: product.images[0] ?? "",
        unitPrice: product.price,
        quantity: 1,
      };
    });
    const quote = quoteCart(items.reduce((sum, item) => sum + item.unitPrice, 0));
    await OrderModel.create({
      orderNumber: `CS-SEED-${index + 1}`,
      userId,
      email: demoAccount.email,
      shippingAddress: {
        fullName: demoAccount.name,
        line1: "18 Harbor Lane",
        line2: "",
        city: "Austin",
        region: "TX",
        postalCode: "78701",
        country: "US",
        phone: "5125550199",
      },
      items,
      subtotal: quote.subtotal,
      shipping: quote.shipping,
      tax: quote.tax,
      total: quote.total,
      paymentMethod: "wallet",
      paymentStatus: "captured",
      refundedCents: 0,
      discount: quote.discount,
      couponCode: "",
      status: "delivered",
      createdAt: new Date(Date.now() - (index + 3) * 86_400_000),
    });
  }
  const lamp = bySlug.get("mare-ceramic-lamp");
  if (lamp) {
    await WishlistModel.create({ userId, productId: lamp._id });
  }
}

async function main() {
  await connectDb();

  await CartModel.deleteMany({});
  await OrderModel.deleteMany({});
  await ReturnModel.deleteMany({});
  await WishlistModel.deleteMany({});
  await ProductModel.deleteMany({});
  await CategoryModel.deleteMany({});

  const categories = await CategoryModel.insertMany(categorySeeds);
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const now = Date.now();

  await ProductModel.insertMany(
    productSeeds.map((product, index) => {
      const category = bySlug.get(product.categorySlug);
      if (!category) {
        throw new Error(`Missing category ${product.categorySlug}`);
      }
      return {
        ...product,
        categoryId: category._id,
        categoryName: category.name,
        currency: "USD",
        status: "active",
        featured: product.featured ?? false,
        createdAt: new Date(now - index * 86_400_000),
        updatedAt: new Date(now - index * 86_400_000),
      };
    }),
  );
  await ProductModel.createIndexes();
  await CouponModel.updateOne(
    { code: "WELCOME10" },
    { $set: { code: "WELCOME10", kind: "percent", amount: 10, minSubtotal: 2000, maxUses: null, expiresAt: null, active: true } },
    { upsert: true },
  );
  await CouponModel.updateOne(
    { code: "SAVE5" },
    { $set: { code: "SAVE5", kind: "fixed", amount: 500, minSubtotal: 0, maxUses: null, expiresAt: null, active: true } },
    { upsert: true },
  );

  const shopper = await seedAccount({
    email: demoAccount.email,
    name: demoAccount.name,
    password: demoAccount.password,
    role: "customer",
    walletCents: coolCash.demoBalanceCents,
    note: "Demo CoolCash",
  });
  await AddressModel.deleteMany({ userId: shopper.id });
  await AddressModel.create({
    userId: shopper.id,
    label: "Home",
    fullName: demoAccount.name,
    line1: "18 Harbor Lane",
    line2: "",
    city: "Austin",
    region: "TX",
    postalCode: "78701",
    country: "US",
    phone: "5125550199",
    isDefault: true,
  });
  await seedSampleHistory(shopper.id);
  await seedAccount({
    email: adminAccount.email,
    name: adminAccount.name,
    password: adminAccount.password,
    role: "admin",
    walletCents: coolCash.welcomeCents,
    note: "Desk CoolCash",
  });

  const reviewers = new Map<string, string>();
  for (const reviewer of sampleReviewers) {
    const user = await seedAccount({
      email: reviewer.email,
      name: reviewer.name,
      password: randomBytes(18).toString("hex"),
      role: "customer",
      walletCents: 0,
      note: "Reviewer account",
    });
    reviewers.set(reviewer.email, user.id);
  }

  await ReviewModel.deleteMany({});
  const reviewed = new Set<string>();
  for (const review of reviewSeeds) {
    const product = await ProductModel.findOne({ slug: review.slug });
    const userId = reviewers.get(review.email);
    if (!product || !userId) continue;
    const author = sampleReviewers.find((person) => person.email === review.email);
    await ReviewModel.create({
      productId: product._id,
      userId,
      authorName: author?.name ?? "Customer",
      rating: review.rating,
      title: review.title,
      body: review.body,
    });
    reviewed.add(product._id.toString());
  }
  for (const productId of reviewed) {
    await refreshProductRating(productId);
  }

  console.log(`Seeded ${categorySeeds.length} departments and ${productSeeds.length} products.`);
  console.log(`Shopper: ${demoAccount.email} / ${demoAccount.password} · CC ${coolCash.demoBalanceCents / 100}`);
  console.log(`Desk: ${adminAccount.email} / ${adminAccount.password}`);
  await disconnectDb();
}

main().catch(async (error) => {
  console.error(error);
  await disconnectDb().catch(() => undefined);
  process.exit(1);
});
