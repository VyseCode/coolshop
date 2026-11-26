import "server-only";

import type { AddressDTO, SessionUser } from "@/domain/types";
import { deleteAddress, listAddresses, saveAddress, setDefaultAddress, ADDRESS_LIMIT } from "@/lib/repositories/address.repository";
import { AppError } from "@/platform/errors";

export function getAddresses(userId: string) {
  return listAddresses(userId);
}

export async function rememberAddress(user: SessionUser, input: AddressDTO & { label?: string }) {
  const saved = await saveAddress(user.id, input);
  if (!saved) {
    throw new AppError(`You can save up to ${ADDRESS_LIMIT} addresses. Remove one first.`);
  }
  return saved;
}

export async function makeDefaultAddress(user: SessionUser, addressId: string) {
  const saved = await setDefaultAddress(user.id, addressId);
  if (!saved) throw new AppError("Address not found.", 404, "not_found");
  return saved;
}

export async function removeAddress(user: SessionUser, addressId: string) {
  const removed = await deleteAddress(user.id, addressId);
  if (!removed) throw new AppError("Address not found.", 404, "not_found");
}
