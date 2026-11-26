import "server-only";

import type { SessionUser } from "@/domain/types";
import { AppError, isDuplicateKey } from "@/platform/errors";
import { assertRateLimit } from "@/platform/rate-limit";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createUser, findAuthByEmail } from "@/lib/repositories/user.repository";
import { grantWelcomeCoolCash } from "@/lib/services/wallet.service";

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  rateKey: string;
}): Promise<SessionUser> {
  assertRateLimit(`register:${input.rateKey}`);
  const passwordHash = await hashPassword(input.password);
  try {
    const user = await createUser({
      name: input.name,
      email: input.email,
      passwordHash,
    });
    await grantWelcomeCoolCash(user.id);
    return user;
  } catch (error) {
    if (isDuplicateKey(error)) {
      throw new AppError("An account with that email already exists.", 409, "email_taken");
    }
    throw error;
  }
}

export async function authenticate(input: {
  email: string;
  password: string;
  rateKey: string;
}): Promise<SessionUser> {
  assertRateLimit(`login:${input.rateKey}:${input.email.toLowerCase()}`);
  const user = await findAuthByEmail(input.email);
  if (!user) throw new AppError("Those sign-in details do not match.", 401, "invalid_login");
  const matches = await verifyPassword(input.password, user.passwordHash);
  if (!matches) throw new AppError("Those sign-in details do not match.", 401, "invalid_login");
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
