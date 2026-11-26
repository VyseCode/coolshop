import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getRequestSession } from "@/lib/auth/session";
import { readJson, toErrorResponse } from "@/lib/http";
import { requestReturn } from "@/lib/services/return.service";
import { AppError } from "@/platform/errors";

const bodySchema = z.object({
  reason: z.string().trim().min(8).max(400),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const parsed = bodySchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Send a reason and at least one item." }, { status: 400 });
    }
    const { id } = await context.params;
    const entry = await requestReturn(session, id, parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ return: entry });
  } catch (error) {
    return toErrorResponse(error);
  }
}
