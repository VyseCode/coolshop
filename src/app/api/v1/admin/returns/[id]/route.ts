import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getRequestSession } from "@/lib/auth/session";
import { readJson, toErrorResponse } from "@/lib/http";
import { approveReturn, rejectReturn } from "@/lib/services/return.service";
import { AppError } from "@/platform/errors";

const bodySchema = z.object({
  action: z.enum(["approve", "reject"]),
  deskNote: z.string().trim().max(240).optional(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const parsed = bodySchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Send action approve or reject." }, { status: 400 });
    }
    const { id } = await context.params;
    const entry =
      parsed.data.action === "approve"
        ? await approveReturn(session, id, parsed.data.deskNote ?? "")
        : await rejectReturn(session, id, parsed.data.deskNote ?? "");
    revalidatePath("/", "layout");
    return NextResponse.json({ return: entry });
  } catch (error) {
    return toErrorResponse(error);
  }
}
