import { formatMoney } from "@/domain/format";
import { FREE_SHIPPING_CENTS } from "@/domain/pricing";
import type { Quote } from "@/domain/types";

export function QuoteSummary({ quote }: { quote: Quote }) {
  const remaining = FREE_SHIPPING_CENTS - quote.subtotal;
  return (
    <div className="space-y-3 text-sm">
      {quote.subtotal > 0 && remaining > 0 ? (
        <p className="rounded-2xl bg-mint px-3 py-2 text-forest">
          Add {formatMoney(remaining)} for free shipping.
        </p>
      ) : null}
      {quote.subtotal >= FREE_SHIPPING_CENTS ? (
        <p className="rounded-2xl bg-mint px-3 py-2 text-forest">You have free shipping.</p>
      ) : null}
      <dl className="space-y-2">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatMoney(quote.subtotal)}</dd>
        </div>
        {quote.discount > 0 ? (
          <div className="flex justify-between text-forest">
            <dt>Code {quote.couponCode}</dt>
            <dd>−{formatMoney(quote.discount)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd>{quote.shipping === 0 ? "Free" : formatMoney(quote.shipping)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Estimated tax</dt>
          <dd>{formatMoney(quote.tax)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatMoney(quote.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
