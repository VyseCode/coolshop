import "server-only";

import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";

import { GUEST_COOKIE, getSession } from "@/lib/auth/session";

function guestCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export async function getExistingOwnerKey() {
  const session = await getSession();
  if (session) return `user:${session.id}`;
  const guest = (await cookies()).get(GUEST_COOKIE)?.value;
  return guest ? `guest:${guest}` : null;
}

export async function ensureOwnerKey() {
  const existing = await getExistingOwnerKey();
  if (existing) return existing;
  const guestId = randomUUID();
  (await cookies()).set(GUEST_COOKIE, guestId, guestCookieOptions());
  return `guest:${guestId}`;
}

export async function readGuestKey() {
  const guest = (await cookies()).get(GUEST_COOKIE)?.value;
  return guest ? `guest:${guest}` : null;
}

export async function clearGuestCookie() {
  (await cookies()).delete(GUEST_COOKIE);
}
