"use client";

import { useState } from "react";
import { useActionState } from "react";

import { formatCoolCash } from "@/domain/format";
import { COUNTRIES } from "@/domain/pricing";
import type { CartDTO, FormState, Quote, SavedAddressDTO } from "@/domain/types";
import { previewCouponAction } from "@/lib/actions/coupon";
import { placeOrderAction } from "@/lib/actions/order";
import { QuoteSummary } from "@/components/shop/quote-summary";
import { inputClass, primaryButtonClass } from "@/components/ui/classes";

type Fields = {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
};

const emptyFields: Fields = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "US",
  phone: "",
};

function fromAddress(address: SavedAddressDTO): Fields {
  return {
    fullName: address.fullName,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    region: address.region,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
  };
}

export function CheckoutForm({
  cart,
  balanceCents,
  addresses,
}: {
  cart: CartDTO;
  balanceCents: number;
  addresses: SavedAddressDTO[];
}) {
  const [state, action, pending] = useActionState(placeOrderAction, null as FormState);
  const errors = state?.fieldErrors;
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<Quote | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);
  const quote = applied ?? cart.quote;
  const canSpend = balanceCents >= quote.total;

  async function applyCode() {
    setCheckingCode(true);
    setCouponError(null);
    const result = await previewCouponAction(coupon);
    setCheckingCode(false);
    if (!result.ok) {
      setApplied(null);
      setCouponError(result.error);
      return;
    }
    setApplied(result.quote);
  }
  const initial = addresses.find((address) => address.isDefault) ?? addresses[0];
  const [choice, setChoice] = useState(initial?.id ?? "new");
  const [fields, setFields] = useState<Fields>(initial ? fromAddress(initial) : emptyFields);

  function choose(id: string) {
    setChoice(id);
    const next = addresses.find((address) => address.id === id);
    setFields(next ? fromAddress(next) : emptyFields);
  }

  function setField(key: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6 rounded-[2rem] border border-line bg-card p-5 sm:p-7">
        <div>
          <h2 className="font-display text-3xl">Shipping</h2>
          <p className="mt-1 text-sm text-muted">
            {addresses.length > 0
              ? "A saved address fills the form. Edits apply to this order."
              : "Save the address if you want it next time."}
          </p>
        </div>
        {addresses.length > 0 ? (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Saved addresses</legend>
            {addresses.map((address) => (
              <label key={address.id} className="flex gap-3 rounded-2xl border border-line bg-white px-3 py-2 text-sm">
                <input
                  type="radio"
                  name="savedAddress"
                  checked={choice === address.id}
                  onChange={() => choose(address.id)}
                />
                <span>
                  <span className="font-medium">{address.label}</span>
                  {address.isDefault ? <span className="text-muted"> · Default</span> : null}
                  <span className="mt-0.5 block text-muted">
                    {address.line1}, {address.city}
                  </span>
                </span>
              </label>
            ))}
            <label className="flex gap-3 rounded-2xl border border-line bg-white px-3 py-2 text-sm">
              <input type="radio" name="savedAddress" checked={choice === "new"} onChange={() => choose("new")} />
              <span className="font-medium">New address</span>
            </label>
          </fieldset>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Full name</span>
            <input name="fullName" autoComplete="name" required value={fields.fullName} onChange={(event) => setField("fullName", event.target.value)} className={`${inputClass} mt-1.5`} />
            {errors?.fullName ? <span className="mt-1 block text-copper">{errors.fullName}</span> : null}
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Address</span>
            <input name="line1" autoComplete="address-line1" required value={fields.line1} onChange={(event) => setField("line1", event.target.value)} className={`${inputClass} mt-1.5`} />
            {errors?.line1 ? <span className="mt-1 block text-copper">{errors.line1}</span> : null}
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Apartment, suite (optional)</span>
            <input name="line2" autoComplete="address-line2" value={fields.line2} onChange={(event) => setField("line2", event.target.value)} className={`${inputClass} mt-1.5`} />
          </label>
          <label className="block text-sm">
            <span className="font-medium">City</span>
            <input name="city" autoComplete="address-level2" required value={fields.city} onChange={(event) => setField("city", event.target.value)} className={`${inputClass} mt-1.5`} />
            {errors?.city ? <span className="mt-1 block text-copper">{errors.city}</span> : null}
          </label>
          <label className="block text-sm">
            <span className="font-medium">State or region</span>
            <input name="region" autoComplete="address-level1" required value={fields.region} onChange={(event) => setField("region", event.target.value)} className={`${inputClass} mt-1.5`} />
            {errors?.region ? <span className="mt-1 block text-copper">{errors.region}</span> : null}
          </label>
          <label className="block text-sm">
            <span className="font-medium">Postal code</span>
            <input name="postalCode" autoComplete="postal-code" required value={fields.postalCode} onChange={(event) => setField("postalCode", event.target.value)} className={`${inputClass} mt-1.5`} />
            {errors?.postalCode ? <span className="mt-1 block text-copper">{errors.postalCode}</span> : null}
          </label>
          <label className="block text-sm">
            <span className="font-medium">Country</span>
            <select name="country" value={fields.country} onChange={(event) => setField("country", event.target.value)} className={`${inputClass} mt-1.5`}>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Phone</span>
            <input name="phone" autoComplete="tel" required value={fields.phone} onChange={(event) => setField("phone", event.target.value)} className={`${inputClass} mt-1.5`} />
            {errors?.phone ? <span className="mt-1 block text-copper">{errors.phone}</span> : null}
          </label>
        </div>
        {choice === "new" ? (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="saveAddress" value="on" defaultChecked={addresses.length === 0} />
            Save this address on my account
          </label>
        ) : null}

        <input type="hidden" name="couponCode" value={applied?.couponCode ?? ""} />
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Coupon</legend>
          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(event) => setCoupon(event.target.value.toUpperCase())}
              placeholder="WELCOME10"
              aria-label="Coupon code"
              className={inputClass}
            />
            <button type="button" onClick={applyCode} disabled={checkingCode || coupon.trim().length < 3} className={primaryButtonClass}>
              {checkingCode ? "Checking…" : "Apply"}
            </button>
          </div>
          {couponError ? <p className="text-sm text-copper">{couponError}</p> : null}
          {applied?.couponCode ? (
            <button
              type="button"
              className="text-sm text-forest"
              onClick={() => {
                setApplied(null);
                setCoupon("");
              }}
            >
              Remove {applied.couponCode}
            </button>
          ) : null}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-display text-3xl">Payment</legend>
          <p className="text-sm text-muted">
            CoolCash is the test currency. 1 CC spends like $1. A real card charge can replace it later.
          </p>
          <label className={`flex gap-3 rounded-2xl border bg-white p-4 ${canSpend ? "border-line" : "border-line opacity-70"}`}>
            <input type="radio" name="paymentMethod" value="wallet" defaultChecked={canSpend} disabled={!canSpend} className="mt-1" />
            <span>
              <span className="block font-medium">Pay with CoolCash</span>
              <span className="mt-1 block text-sm text-muted">
                Balance {formatCoolCash(balanceCents)}. This order is {formatCoolCash(quote.total)}.
                {canSpend
                  ? " Cancelling before it ships returns the CoolCash."
                  : ` You are short ${formatCoolCash(quote.total - balanceCents)}.`}
              </span>
            </span>
          </label>
          <label className="flex gap-3 rounded-2xl border border-line bg-white p-4">
            <input type="radio" name="paymentMethod" value="cod" defaultChecked={!canSpend} className="mt-1" />
            <span>
              <span className="block font-medium">Pay on delivery</span>
              <span className="mt-1 block text-sm text-muted">No CoolCash is spent. The order stays unpaid until it is shipped.</span>
            </span>
          </label>
        </fieldset>
        {state?.error ? (
          <p className="text-sm text-copper" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>

      <aside className="h-fit rounded-[2rem] border border-line bg-card p-5 lg:sticky lg:top-36">
        <h2 className="font-display text-3xl">Your bag</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {cart.items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-3">
              <span>
                {item.name}
                <span className="text-muted"> × {item.quantity}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <QuoteSummary quote={quote} />
        </div>
        <button className={`${primaryButtonClass} mt-5 w-full`} disabled={pending}>
          {pending ? "Placing order…" : "Place order"}
        </button>
      </aside>
    </form>
  );
}
