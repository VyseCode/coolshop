import "server-only";

import type { Role, SessionUser } from "@/domain/types";
import { connectDb } from "@/lib/db/connect";
import { UserModel } from "@/lib/db/models/user";

export async function findAuthByEmail(email: string) {
  await connectDb();
  const user = await UserModel.findOne({ email: email.toLowerCase() }).select("+passwordHash").lean();
  if (!user) return null;
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role as Role,
    passwordHash: user.passwordHash,
  };
}

export async function findUserById(id: string): Promise<SessionUser | null> {
  await connectDb();
  const user = await UserModel.findById(id).lean();
  if (!user) return null;
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role as Role,
  };
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<SessionUser> {
  await connectDb();
  const user = await UserModel.create({
    email: input.email.toLowerCase(),
    name: input.name,
    passwordHash: input.passwordHash,
    role: "customer",
  });
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: "customer",
  };
}
