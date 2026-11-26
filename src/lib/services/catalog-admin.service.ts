import "server-only";

import type { SessionUser } from "@/domain/types";
import {
  findAdminProduct,
  insertProduct,
  listAdminProducts,
  updateProduct,
  type ProductWrite,
} from "@/lib/repositories/catalog.repository";
import { AppError } from "@/platform/errors";

function assertAdmin(user: SessionUser) {
  if (user.role !== "admin") throw new AppError("Admin only.", 403, "forbidden");
}

export function listDeskProducts(user: SessionUser, query: { q: string; page: number }) {
  assertAdmin(user);
  return listAdminProducts({ ...query, pageSize: 20 });
}

export function getDeskProduct(user: SessionUser, id: string) {
  assertAdmin(user);
  return findAdminProduct(id);
}

export async function createDeskProduct(user: SessionUser, input: ProductWrite) {
  assertAdmin(user);
  const product = await insertProduct(input);
  if (!product) throw new AppError("Choose a department that exists.");
  return product;
}

export async function updateDeskProduct(user: SessionUser, id: string, input: ProductWrite) {
  assertAdmin(user);
  const product = await updateProduct(id, input);
  if (!product) throw new AppError("That product or department was not found.", 404, "not_found");
  return product;
}
