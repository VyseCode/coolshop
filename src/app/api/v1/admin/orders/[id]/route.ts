import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getRequestSession } from "@/lib/auth/session";
import { readJson, toErrorResponse } from "@/lib/http";
import { deskCancelOrder, markOrderDelivered, markOrderShipped } from "@/lib/services/order.service";
import { AppError } from "@/platform/errors";

const actionSchema = z.object({ action: z.enum(["ship", "deliver", "cancel"]) });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getRequestSession(request);
    if (!session) throw new AppError("Sign in to continue.", 401, "unauthorized");
    const parsed = actionSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return NextResponse.json({ error: "Send action ship, deliver, or cancel." }, { status: 400 });
    }
    const { id } = await context.params;
    const order =
      parsed.data.action === "ship"
        ? await markOrderShipped(session, id)
        : parsed.data.action === "deliver"
          ? await markOrderDelivered(session, id)
          : await deskCancelOrder(session, id);
    revalidatePath("/", "layout");
    return NextResponse.json({ order });
  } catch (error) {
    return toErrorResponse(error);
  }
}
