import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRequestSession } from "@/lib/auth/session";
import { readJson, toErrorResponse } from "@/lib/http";
import { getAddresses, rememberAddress } from "@/lib/services/address.service";
import { addressSchema } from "@/lib/validators/forms";
import { AppError } from "@/platform/errors";

export async function GET(request: Request) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const addresses = await getAddresses(session.id);
    return NextResponse.json({ addresses });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const body = await readJson(request);
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Check the address." }, { status: 400 });
    const label = typeof body === "object" && body && "label" in body ? String(body.label ?? "") : "";
    const address = await rememberAddress(session, { ...parsed.data, line2: parsed.data.line2 ?? "", label });
    revalidatePath("/account");
    revalidatePath("/checkout");
    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
