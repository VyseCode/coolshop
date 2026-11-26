import "server-only";

import type { DeskDashboardDTO, SessionUser } from "@/domain/types";
import { AppError } from "@/platform/errors";
import { listLowStockProducts } from "@/lib/repositories/catalog.repository";
import { aggregateSalesStats } from "@/lib/repositories/order.repository";
import { countOpenReturns } from "@/lib/repositories/return.repository";

function assertAdmin(user: SessionUser) {
  if (user.role !== "admin") throw new AppError("Admin only.", 403, "forbidden");
}

export async function getDeskDashboard(user: SessionUser): Promise<DeskDashboardDTO> {
  assertAdmin(user);
  const [sales, openReturns, lowStock] = await Promise.all([
    aggregateSalesStats(),
    countOpenReturns(),
    listLowStockProducts(5, 8),
  ]);
  return {
    revenueCents: sales.revenueCents,
    grossCents: sales.grossCents,
    refundedCents: sales.refundedCents,
    paidOrderCount: sales.paidOrderCount,
    openOrders: sales.openOrders,
    openReturns,
    lowStock,
    coupons: sales.coupons,
  };
}
