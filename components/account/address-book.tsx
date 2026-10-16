import { createAddress, deleteAddress, setDefaultAddress, updateAddress } from "@/app/(account)/actions";

const fieldClass =
  "mt-1.5 h-11 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-ink outline-none focus:border-ink";

export type AddressRecord = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

function AddressFields({ address }: { address?: AddressRecord }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-bold text-ink sm:col-span-2" htmlFor={address ? `name-${address.id}` : "name"}>
        Name
        <input
          id={address ? `name-${address.id}` : "name"}
          name="name"
          required
          maxLength={80}
          defaultValue={address?.name}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm font-bold text-ink" htmlFor={address ? `phone-${address.id}` : "phone"}>
        Phone
        <input
          id={address ? `phone-${address.id}` : "phone"}
          name="phone"
          type="tel"
          required
          maxLength={20}
          defaultValue={address?.phone}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm font-bold text-ink" htmlFor={address ? `postal-${address.id}` : "postalCode"}>
        Postal code
        <input
          id={address ? `postal-${address.id}` : "postalCode"}
          name="postalCode"
          required
          maxLength={12}
          defaultValue={address?.postalCode}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm font-bold text-ink sm:col-span-2" htmlFor={address ? `line1-${address.id}` : "line1"}>
        Address line 1
        <input
          id={address ? `line1-${address.id}` : "line1"}
          name="line1"
          required
          maxLength={160}
          defaultValue={address?.line1}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm font-bold text-ink sm:col-span-2" htmlFor={address ? `line2-${address.id}` : "line2"}>
        Address line 2
        <input
          id={address ? `line2-${address.id}` : "line2"}
          name="line2"
          maxLength={160}
          defaultValue={address?.line2 ?? ""}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm font-bold text-ink" htmlFor={address ? `city-${address.id}` : "city"}>
        City
        <input
          id={address ? `city-${address.id}` : "city"}
          name="city"
          required
          maxLength={80}
          defaultValue={address?.city}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm font-bold text-ink" htmlFor={address ? `state-${address.id}` : "state"}>
        State
        <input
          id={address ? `state-${address.id}` : "state"}
          name="state"
          required
          maxLength={80}
          defaultValue={address?.state}
          className={fieldClass}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-ink sm:col-span-2">
        <input type="checkbox" name="isDefault" defaultChecked={address?.isDefault ?? false} className="h-4 w-4" />
        Default address
      </label>
    </div>
  );
}

export function AddressBook({
  addresses,
  editingId,
  error,
}: {
  addresses: AddressRecord[];
  editingId?: string;
  error?: string;
}) {
  return (
    <div className="mt-6 space-y-4">
      {error ? <p className="text-sm font-semibold text-ink">{error}</p> : null}
      {addresses.length === 0 ? (
        <p className="rounded-3xl bg-[#f6f6f7] px-5 py-8 text-sm text-muted">No saved addresses yet.</p>
      ) : (
        <ul className="space-y-4">
          {addresses.map((address) =>
            address.id === editingId ? (
              <li key={address.id} className="rounded-3xl border border-neutral-200 p-5">
                <form action={updateAddress} className="space-y-4">
                  <input type="hidden" name="id" value={address.id} />
                  <AddressFields address={address} />
                  <div className="flex flex-wrap gap-3">
                    <button type="submit" className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white">
                      Save address
                    </button>
                    <a href="/account/addresses" className="rounded-full px-5 py-2.5 text-sm font-semibold text-muted">
                      Cancel
                    </a>
                  </div>
                </form>
              </li>
            ) : (
              <li key={address.id} className="rounded-3xl border border-neutral-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink">
                      {address.name}
                      {address.isDefault ? (
                        <span className="ml-2 rounded-full bg-[#f3f3f4] px-2 py-0.5 text-xs font-bold tracking-wide text-ink uppercase">
                          Default
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm text-muted">{address.phone}</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}
                      <br />
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/account/addresses?edit=${address.id}`}
                      className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-ink"
                    >
                      Edit
                    </a>
                    {address.isDefault ? null : (
                      <form action={setDefaultAddress}>
                        <input type="hidden" name="id" value={address.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-ink"
                        >
                          Set default
                        </button>
                      </form>
                    )}
                    <form action={deleteAddress}>
                      <input type="hidden" name="id" value={address.id} />
                      <button type="submit" className="rounded-full px-4 py-2 text-sm font-semibold text-muted">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      <section className="rounded-3xl bg-[#f6f6f7] p-5">
        <h2 className="text-sm font-bold tracking-wide text-ink">Add an address</h2>
        <form action={createAddress} className="mt-4 space-y-4">
          <AddressFields />
          <button type="submit" className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white">
            Save address
          </button>
        </form>
      </section>
    </div>
  );
}
