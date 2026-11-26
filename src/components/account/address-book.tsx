"use client";

import { useActionState } from "react";

import { countryName, COUNTRIES } from "@/domain/pricing";
import type { FormState, SavedAddressDTO } from "@/domain/types";
import { defaultAddressAction, deleteAddressAction, saveAddressAction } from "@/lib/actions/address";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/classes";

export function AddressBook({ addresses }: { addresses: SavedAddressDTO[] }) {
  const [state, action, pending] = useActionState(saveAddressAction, null as FormState);

  return (
    <section className="mt-8">
      <h2 className="font-display text-3xl">Addresses</h2>
      <p className="mt-2 text-sm text-muted">The default address is filled in at checkout.</p>
      {addresses.length === 0 ? <p className="mt-4 text-sm text-muted">No saved addresses yet.</p> : null}
      <ul className="mt-4 space-y-3">
        {addresses.map((address) => (
          <li key={address.id} className="rounded-3xl border border-line bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {address.label}
                  {address.isDefault ? <span className="ml-2 text-xs font-semibold text-forest">Default</span> : null}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {address.fullName}
                  <br />
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                  <br />
                  {address.city}, {address.region} {address.postalCode}
                  <br />
                  {countryName(address.country)} · {address.phone}
                </p>
              </div>
              <div className="flex gap-2">
                {address.isDefault ? null : (
                  <form action={defaultAddressAction}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <button className={secondaryButtonClass} type="submit">
                      Make default
                    </button>
                  </form>
                )}
                <form action={deleteAddressAction}>
                  <input type="hidden" name="addressId" value={address.id} />
                  <button className={secondaryButtonClass} type="submit">
                    Remove
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <form action={action} className="mt-6 grid gap-4 rounded-3xl border border-line bg-card p-5 sm:grid-cols-2">
        <h3 className="font-medium sm:col-span-2">Add an address</h3>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium">Label</span>
          <input name="label" placeholder="Home" className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium">Full name</span>
          <input name="fullName" required className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium">Address</span>
          <input name="line1" required className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium">Apartment, suite (optional)</span>
          <input name="line2" className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">City</span>
          <input name="city" required className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">State or region</span>
          <input name="region" required className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Postal code</span>
          <input name="postalCode" required className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Country</span>
          <select name="country" defaultValue="US" className={`${inputClass} mt-1.5`}>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium">Phone</span>
          <input name="phone" required className={`${inputClass} mt-1.5`} />
        </label>
        {state?.error ? <p className="text-sm text-copper sm:col-span-2">{state.error}</p> : null}
        {state?.ok ? <p className="text-sm text-forest sm:col-span-2">Address saved.</p> : null}
        <button className={`${primaryButtonClass} sm:col-span-2 sm:w-fit`} disabled={pending}>
          {pending ? "Saving…" : "Save address"}
        </button>
      </form>
    </section>
  );
}
