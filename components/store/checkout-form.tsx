"use client";

import { useState, type FormEvent } from "react";
import { formatInr } from "@/lib/format";

export type CheckoutAddress = {
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

export type CheckoutLine = {
  key: string;
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  gstAmount: number;
  lineTotal: number;
  image: string | null;
  slug: string;
};

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccess) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

type RazorpayCheckout = {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  orderId: string;
  prefill: { name: string; email: string; contact: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

const fieldClass =
  "mt-1.5 h-11 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-ink outline-none focus:border-ink";

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutForm({
  addresses,
  lines,
  subtotal,
  gst,
  total,
  onlineMode,
  blocked,
}: {
  addresses: CheckoutAddress[];
  lines: CheckoutLine[];
  subtotal: number;
  gst: number;
  total: number;
  onlineMode: "razorpay" | "demo";
  blocked: string | null;
}) {
  const initialAddress = addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? "new";
  const [addressChoice, setAddressChoice] = useState(initialAddress);
  const [payment, setPayment] = useState<"cod" | "online">("cod");
  const [error, setError] = useState<string | null>(blocked);
  const [pending, setPending] = useState(false);

  async function confirmRazorpay(checkout: RazorpayCheckout) {
    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      setError("Razorpay checkout could not be loaded.");
      setPending(false);
      return;
    }

    const Razorpay = window.Razorpay;
    const instance = new Razorpay({
      key: checkout.keyId,
      amount: checkout.amount,
      currency: checkout.currency,
      name: checkout.name,
      description: checkout.description,
      order_id: checkout.razorpayOrderId,
      prefill: checkout.prefill,
      theme: { color: "#111111" },
      modal: {
        ondismiss: () => {
          setPending(false);
          setError("Payment was not completed. Your bag is unchanged.");
        },
      },
      handler: (response) => {
        void (async () => {
          try {
            const verify = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: checkout.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const payload = (await verify.json().catch(() => null)) as { error?: string; orderId?: string } | null;
            if (!verify.ok || !payload?.orderId) {
              setPending(false);
              setError(payload?.error || "Payment could not be confirmed.");
              return;
            }
            window.location.assign(`/order/${payload.orderId}`);
          } catch {
            setPending(false);
            setError("Payment could not be confirmed.");
          }
        })();
      },
    });
    try {
      instance.open();
    } catch {
      setPending(false);
      setError("Razorpay checkout could not be opened.");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (blocked) return;
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const choice = String(form.get("addressChoice") ?? "");
    const body: Record<string, unknown> = {
      payment,
      saveAddress: form.get("saveAddress") === "on",
    };
    if (choice && choice !== "new") {
      body.addressId = choice;
    } else {
      body.address = {
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        line1: String(form.get("line1") ?? ""),
        line2: String(form.get("line2") ?? ""),
        city: String(form.get("city") ?? ""),
        state: String(form.get("state") ?? ""),
        postalCode: String(form.get("postalCode") ?? ""),
      };
    }

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; mode?: string; orderId?: string }
      | (RazorpayCheckout & { mode?: string; error?: string })
      | null;

    if (!response.ok || !payload || payload.error) {
      setPending(false);
      setError(payload?.error || "Checkout could not be completed.");
      return;
    }

    if (payload.mode === "redirect" && payload.orderId) {
      window.location.assign(`/order/${payload.orderId}`);
      return;
    }

    if (payload.mode === "razorpay" && payload.orderId && "keyId" in payload && payload.keyId) {
      await confirmRazorpay(payload);
      return;
    }

    setPending(false);
    setError("Checkout could not be completed.");
  }

  const payLabel =
    payment === "cod" ? "Place order" : onlineMode === "demo" ? "Confirm demo payment" : "Pay online";

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="space-y-8">
        <section>
          <h2 className="text-sm font-bold tracking-wide text-ink">1 · Address</h2>
          <div className="mt-4 space-y-3">
            {addresses.map((address) => (
              <label
                key={address.id}
                className="flex cursor-pointer gap-3 rounded-3xl border border-neutral-200 p-4 has-[:checked]:border-ink"
              >
                <input
                  type="radio"
                  name="addressChoice"
                  value={address.id}
                  checked={addressChoice === address.id}
                  onChange={() => setAddressChoice(address.id)}
                  className="mt-1"
                />
                <span className="text-sm leading-relaxed text-ink">
                  <span className="font-bold">
                    {address.name}
                    {address.isDefault ? <span className="ml-2 text-xs font-semibold text-muted">Default</span> : null}
                  </span>
                  <br />
                  {address.phone}
                  <br />
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                </span>
              </label>
            ))}
            <label className="flex cursor-pointer gap-3 rounded-3xl border border-neutral-200 p-4 has-[:checked]:border-ink">
              <input
                type="radio"
                name="addressChoice"
                value="new"
                checked={addressChoice === "new"}
                onChange={() => setAddressChoice("new")}
                className="mt-1"
              />
              <span className="text-sm font-bold text-ink">Use a new address for this order</span>
            </label>
          </div>

          {addressChoice === "new" ? (
            <div className="mt-4 grid gap-4 rounded-3xl bg-[#f6f6f7] p-5 sm:grid-cols-2">
              <label className="block text-sm font-bold text-ink sm:col-span-2">
                Name
                <input name="name" required maxLength={80} className={fieldClass} />
              </label>
              <label className="block text-sm font-bold text-ink">
                Phone
                <input name="phone" type="tel" required maxLength={20} className={fieldClass} />
              </label>
              <label className="block text-sm font-bold text-ink">
                Postal code
                <input name="postalCode" required maxLength={12} className={fieldClass} />
              </label>
              <label className="block text-sm font-bold text-ink sm:col-span-2">
                Address line 1
                <input name="line1" required maxLength={160} className={fieldClass} />
              </label>
              <label className="block text-sm font-bold text-ink sm:col-span-2">
                Address line 2
                <input name="line2" maxLength={160} className={fieldClass} />
              </label>
              <label className="block text-sm font-bold text-ink">
                City
                <input name="city" required maxLength={80} className={fieldClass} />
              </label>
              <label className="block text-sm font-bold text-ink">
                State
                <input name="state" required maxLength={80} className={fieldClass} />
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-ink sm:col-span-2">
                <input type="checkbox" name="saveAddress" className="h-4 w-4" />
                Save this address
              </label>
            </div>
          ) : null}
        </section>

        <section>
          <h2 className="text-sm font-bold tracking-wide text-ink">2 · Summary</h2>
          <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-4 py-4">
                <a href={`/product/${line.slug}`} className="h-24 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#f2f2f2]">
                  {line.image ? <img src={line.image} alt="" className="h-full w-full object-cover" /> : null}
                </a>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink">{line.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    Size {line.size} · Qty {line.quantity}
                  </p>
                  <p className="mt-1 text-sm text-ink">
                    {formatInr(line.unitPrice)} · GST {line.gstRate}% ({formatInr(line.gstAmount)})
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-ink">{formatInr(line.lineTotal)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-bold tracking-wide text-ink">3 · Payment</h2>
          <div className="mt-4 space-y-3">
            <label className="flex cursor-pointer gap-3 rounded-3xl border border-neutral-200 p-4 has-[:checked]:border-ink">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={payment === "cod"}
                onChange={() => setPayment("cod")}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-bold text-ink">Cash on delivery</span>
                <span className="mt-1 block text-sm text-muted">Pay when the order arrives. Payment stays pending.</span>
              </span>
            </label>
            <label className="flex cursor-pointer gap-3 rounded-3xl border border-neutral-200 p-4 has-[:checked]:border-ink">
              <input
                type="radio"
                name="payment"
                value="online"
                checked={payment === "online"}
                onChange={() => setPayment("online")}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-bold text-ink">Pay online</span>
                <span className="mt-1 block text-sm text-muted">
                  {onlineMode === "demo"
                    ? "Demo payment. No charge is made, and the order is marked paid when you confirm."
                    : "Pay with Razorpay. The order is marked paid after the payment is verified."}
                </span>
              </span>
            </label>
          </div>
        </section>
      </div>

      <aside className="rounded-3xl bg-[#f6f6f7] p-5 lg:sticky lg:top-6">
        <h2 className="text-sm font-bold tracking-wide text-ink">Total</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-semibold text-ink">{formatInr(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">GST</dt>
            <dd className="font-semibold text-ink">{formatInr(gst)}</dd>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-2">
            <dt className="font-bold text-ink">Total</dt>
            <dd className="font-bold text-ink">{formatInr(total)}</dd>
          </div>
        </dl>
        {error ? <p className="mt-4 text-sm font-semibold text-ink">{error}</p> : null}
        <button
          type="submit"
          disabled={pending || Boolean(blocked)}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {pending ? "Placing order…" : payLabel}
        </button>
      </aside>
    </form>
  );
}
