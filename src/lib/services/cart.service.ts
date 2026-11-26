import "server-only";

import { quoteCart } from "@/domain/pricing";
import type { CartDTO, CartItemDTO } from "@/domain/types";
import { AppError } from "@/platform/errors";
import { deleteCart, readCart, writeCart, type StoredCartItem } from "@/lib/repositories/cart.repository";
import { findProductsByIds } from "@/lib/repositories/catalog.repository";

const MAX_QTY = 20;

export function emptyCart(): CartDTO {
  return { items: [], itemCount: 0, quote: quoteCart(0) };
}

async function present(items: StoredCartItem[]): Promise<CartDTO> {
  if (items.length === 0) return emptyCart();
  const products = await findProductsByIds(items.map((item) => item.productId));
  const lines: CartItemDTO[] = [];
  for (const item of items) {
    const product = products.get(item.productId);
    if (!product || product.stock < 1) continue;
    const quantity = Math.min(item.quantity, product.stock, MAX_QTY);
    lines.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: product.image,
      unitPrice: product.price,
      quantity,
      stock: product.stock,
      lineTotal: product.price * quantity,
    });
  }
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  return {
    items: lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    quote: quoteCart(subtotal),
  };
}

export async function getCart(ownerKey: string) {
  return present(await readCart(ownerKey));
}

export async function addItem(ownerKey: string, productId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
    throw new AppError("Choose a quantity between 1 and 20.");
  }
  const products = await findProductsByIds([productId]);
  const product = products.get(productId);
  if (!product) throw new AppError("That product is no longer available.", 404, "not_found");
  if (product.stock < 1) throw new AppError("This item is out of stock.");

  const current = await readCart(ownerKey);
  const existing = current.find((item) => item.productId === productId);
  const nextQuantity = Math.min((existing?.quantity ?? 0) + quantity, product.stock, MAX_QTY);
  if ((existing?.quantity ?? 0) + quantity > product.stock) {
    throw new AppError(`Only ${product.stock} left in stock.`);
  }
  const items = existing
    ? current.map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item))
    : [...current, { productId, quantity: nextQuantity }];
  await writeCart(ownerKey, items);
  return present(items);
}

export async function setItemQuantity(ownerKey: string, productId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QTY) {
    throw new AppError("Choose a quantity between 0 and 20.");
  }
  const current = await readCart(ownerKey);
  if (quantity === 0) {
    const items = current.filter((item) => item.productId !== productId);
    await writeCart(ownerKey, items);
    return present(items);
  }
  const products = await findProductsByIds([productId]);
  const product = products.get(productId);
  if (!product) throw new AppError("That product is no longer available.", 404, "not_found");
  if (quantity > product.stock) throw new AppError(`Only ${product.stock} left in stock.`);
  const exists = current.some((item) => item.productId === productId);
  const items = exists
    ? current.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    : [...current, { productId, quantity }];
  await writeCart(ownerKey, items);
  return present(items);
}

export async function removeItem(ownerKey: string, productId: string) {
  return setItemQuantity(ownerKey, productId, 0);
}

export async function clearCart(ownerKey: string) {
  await writeCart(ownerKey, []);
}

export async function mergeGuestCart(userId: string, guestKey: string | null) {
  const userKey = `user:${userId}`;
  if (!guestKey) return getCart(userKey);
  const [guestItems, userItems] = await Promise.all([readCart(guestKey), readCart(userKey)]);
  if (guestItems.length === 0) {
    await deleteCart(guestKey);
    return present(userItems);
  }
  const merged = new Map<string, number>();
  for (const item of [...userItems, ...guestItems]) {
    merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
  }
  const products = await findProductsByIds([...merged.keys()]);
  const items: StoredCartItem[] = [];
  for (const [productId, quantity] of merged) {
    const product = products.get(productId);
    if (!product || product.stock < 1) continue;
    items.push({ productId, quantity: Math.min(quantity, product.stock, MAX_QTY) });
  }
  await writeCart(userKey, items);
  await deleteCart(guestKey);
  return present(items);
}
