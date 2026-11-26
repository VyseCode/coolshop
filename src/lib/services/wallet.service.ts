import "server-only";

import { coolCash } from "@/config/site";
import { creditWallet, readWallet } from "@/lib/repositories/wallet.repository";

export function getWallet(userId: string) {
  return readWallet(userId);
}

export function grantWelcomeCoolCash(userId: string) {
  return creditWallet(userId, coolCash.welcomeCents, {
    type: "grant",
    note: "Welcome CoolCash",
  });
}
