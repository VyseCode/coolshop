import { NextResponse } from "next/server";

import { clearGuestCookie, readGuestKey } from "@/lib/auth/owner";
import { setSessionCookie } from "@/lib/auth/session";
import { clientKeyFrom, readJson, toErrorResponse } from "@/lib/http";
import { mergeGuestCart } from "@/lib/services/cart.service";
import { authenticate } from "@/lib/services/auth.service";
import { loginSchema } from "@/lib/validators/forms";

export async function POST(request: Request) {
  try {
    const parsed = loginSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Check your email and password." }, { status: 400 });
    }
    const user = await authenticate({ ...parsed.data, rateKey: clientKeyFrom(request) });
    const guestKey = await readGuestKey();
    await mergeGuestCart(user.id, guestKey);
    await clearGuestCookie();
    const token = await setSessionCookie(user);
    return NextResponse.json({ user, token });
  } catch (error) {
    return toErrorResponse(error);
  }
}
