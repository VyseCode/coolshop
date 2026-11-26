import { NextResponse } from "next/server";

import { clearGuestCookie, readGuestKey } from "@/lib/auth/owner";
import { setSessionCookie } from "@/lib/auth/session";
import { clientKeyFrom, readJson, toErrorResponse } from "@/lib/http";
import { mergeGuestCart } from "@/lib/services/cart.service";
import { registerUser } from "@/lib/services/auth.service";
import { registerSchema } from "@/lib/validators/forms";

export async function POST(request: Request) {
  try {
    const parsed = registerSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Check the registration details." }, { status: 400 });
    }
    const user = await registerUser({ ...parsed.data, rateKey: clientKeyFrom(request) });
    const guestKey = await readGuestKey();
    await mergeGuestCart(user.id, guestKey);
    await clearGuestCookie();
    const token = await setSessionCookie(user);
    return NextResponse.json({ user, token }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
