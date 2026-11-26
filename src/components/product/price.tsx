import { discountPercent, formatMoney } from "@/domain/format";

export function Price({
  price,
  compareAt,
  size = "md",
}: {
  price: number;
  compareAt?: number | null;
  size?: "md" | "lg";
}) {
  const off = discountPercent(price, compareAt);
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={size === "lg" ? "text-3xl font-semibold tracking-tight" : "text-lg font-semibold"}>
        {formatMoney(price)}
      </span>
      {compareAt && compareAt > price ? (
        <span className="text-sm text-muted line-through">{formatMoney(compareAt)}</span>
      ) : null}
      {off ? <span className="text-xs font-semibold text-copper">{off}% off</span> : null}
    </p>
  );
}
