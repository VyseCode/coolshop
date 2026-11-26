import "server-only";

import { Types } from "mongoose";

import type { AddressDTO, SavedAddressDTO } from "@/domain/types";
import { connectDb } from "@/lib/db/connect";
import { AddressModel, type AddressEntity } from "@/lib/db/models/address";

const ADDRESS_LIMIT = 8;

function toAddress(doc: AddressEntity): SavedAddressDTO {
  return {
    id: doc._id.toString(),
    label: doc.label || "Address",
    fullName: doc.fullName,
    line1: doc.line1,
    line2: doc.line2 ?? "",
    city: doc.city,
    region: doc.region,
    postalCode: doc.postalCode,
    country: doc.country,
    phone: doc.phone,
    isDefault: doc.isDefault,
  };
}

function samePlace(left: AddressDTO, right: Pick<AddressEntity, "line1" | "postalCode" | "country">) {
  return (
    left.line1.trim().toLowerCase() === right.line1.trim().toLowerCase() &&
    left.postalCode.trim().toLowerCase() === right.postalCode.trim().toLowerCase() &&
    left.country === right.country
  );
}

export async function listAddresses(userId: string) {
  await connectDb();
  if (!Types.ObjectId.isValid(userId)) return [];
  const docs = await AddressModel.find({ userId }).sort({ isDefault: -1, updatedAt: -1 }).lean();
  return docs.map((doc) => toAddress(doc));
}

export async function saveAddress(
  userId: string,
  input: AddressDTO & { label?: string },
) {
  await connectDb();
  const existing = await AddressModel.find({ userId }).sort({ isDefault: -1 }).lean();
  const match = existing.find((address) => samePlace(input, address));
  if (match) return toAddress(match);
  if (existing.length >= ADDRESS_LIMIT) {
    return null;
  }
  const doc = await AddressModel.create({
    userId,
    label: input.label?.trim() || (existing.length === 0 ? "Home" : "Address"),
    fullName: input.fullName,
    line1: input.line1,
    line2: input.line2,
    city: input.city,
    region: input.region,
    postalCode: input.postalCode,
    country: input.country,
    phone: input.phone,
    isDefault: existing.length === 0,
  });
  const saved = await AddressModel.findById(doc._id).lean();
  if (!saved) throw new Error("Address was not saved.");
  return toAddress(saved);
}

export async function setDefaultAddress(userId: string, addressId: string) {
  await connectDb();
  if (!Types.ObjectId.isValid(addressId)) return null;
  const doc = await AddressModel.findOneAndUpdate(
    { _id: addressId, userId },
    { $set: { isDefault: true } },
    { returnDocument: "after" },
  ).lean();
  if (!doc) return null;
  await AddressModel.updateMany({ userId, _id: { $ne: addressId } }, { $set: { isDefault: false } });
  return toAddress(doc);
}

export async function deleteAddress(userId: string, addressId: string) {
  await connectDb();
  if (!Types.ObjectId.isValid(addressId)) return false;
  const removed = await AddressModel.findOneAndDelete({ _id: addressId, userId }).lean();
  if (!removed) return false;
  if (removed.isDefault) {
    const next = await AddressModel.findOne({ userId }).sort({ updatedAt: -1 });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }
  return true;
}

export { ADDRESS_LIMIT };
