import "server-only";

import { Types } from "mongoose";

import type { LedgerEntryDTO, LedgerType, WalletDTO } from "@/domain/types";
import { connectDb } from "@/lib/db/connect";
import { LedgerModel, type LedgerEntity } from "@/lib/db/models/ledger";
import { UserModel } from "@/lib/db/models/user";
import { AppError } from "@/platform/errors";

function toEntry(doc: LedgerEntity & { createdAt?: Date }): LedgerEntryDTO {
  return {
    id: doc._id.toString(),
    type: doc.type as LedgerType,
    amountCents: doc.amountCents,
    balanceAfter: doc.balanceAfter,
    note: doc.note,
    orderId: doc.orderId ? doc.orderId.toString() : null,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
  };
}

export async function readWallet(userId: string): Promise<WalletDTO> {
  await connectDb();
  if (!Types.ObjectId.isValid(userId)) return { balanceCents: 0, entries: [] };
  const [user, entries] = await Promise.all([
    UserModel.findById(userId).lean(),
    LedgerModel.find({ userId }).sort({ createdAt: -1 }).limit(12).lean(),
  ]);
  return {
    balanceCents: user?.walletCents ?? 0,
    entries: entries.map((entry) => toEntry(entry)),
  };
}

export async function creditWallet(
  userId: string,
  amountCents: number,
  input: { type: "grant" | "refund"; note: string; orderId?: string; reference?: string },
) {
  await connectDb();
  if (amountCents <= 0) throw new AppError("Credit amount must be positive.");
  const updated = await UserModel.findByIdAndUpdate(
    userId,
    { $inc: { walletCents: amountCents } },
    { returnDocument: "after" },
  );
  if (!updated) throw new AppError("Account not found.", 404, "not_found");
  await LedgerModel.create({
    userId,
    type: input.type,
    amountCents,
    balanceAfter: updated.walletCents,
    note: input.note,
    orderId: input.orderId ?? null,
    reference: input.reference ?? "",
  });
  return updated.walletCents;
}

export async function debitWallet(
  userId: string,
  amountCents: number,
  input: { note: string; reference: string },
) {
  await connectDb();
  if (amountCents <= 0) return { balanceCents: 0, reference: input.reference };
  const updated = await UserModel.findOneAndUpdate(
    { _id: userId, walletCents: { $gte: amountCents } },
    { $inc: { walletCents: -amountCents } },
    { returnDocument: "after" },
  );
  if (!updated) {
    throw new AppError("Not enough CoolCash for this order.", 402, "insufficient_funds");
  }
  await LedgerModel.create({
    userId,
    type: "purchase",
    amountCents: -amountCents,
    balanceAfter: updated.walletCents,
    note: input.note,
    reference: input.reference,
  });
  return { balanceCents: updated.walletCents ?? 0, reference: input.reference };
}

export async function attachLedgerOrder(reference: string, orderId: string) {
  await connectDb();
  if (!reference || !Types.ObjectId.isValid(orderId)) return;
  await LedgerModel.updateOne({ reference }, { orderId });
}

export async function refundOrderPayment(
  userId: string,
  orderId: string,
  amountCents: number,
  input?: { note?: string; reference?: string },
) {
  await connectDb();
  if (!Types.ObjectId.isValid(orderId) || amountCents <= 0) return;
  const reference = input?.reference ?? `cancel:${orderId}`;
  const existing = await LedgerModel.findOne({ reference, type: "refund" }).lean();
  if (existing) return existing.balanceAfter;
  return creditWallet(userId, amountCents, {
    type: "refund",
    note: input?.note ?? "Order cancelled",
    orderId,
    reference,
  });
}
