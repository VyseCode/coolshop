import { Star } from "lucide-react";

export function Stars({ value, count }: { value: number; count?: number }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex" aria-label={`${value.toFixed(1)} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`size-3.5 ${index < rounded ? "fill-copper text-copper" : "text-line"}`}
          />
        ))}
      </span>
      {typeof count === "number" ? <span className="text-xs text-muted">({count})</span> : null}
    </span>
  );
}
