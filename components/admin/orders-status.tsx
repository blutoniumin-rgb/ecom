"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { advanceOrder, type OrderActionState } from "@/components/admin/orders-actions";
import { NEXT_ORDER_STATUS, advanceLabel, type OrderStatus } from "@/components/admin/orders-query";

const fieldClass =
  "mt-2 w-full rounded-2xl bg-admin-bg px-4 py-3 text-sm text-admin-ink outline-none ring-1 ring-black/[0.04] placeholder:text-admin-muted focus:ring-2 focus:ring-admin-accent/30";

export function OrderStatusControl({
  orderId,
  status,
  paymentMethod,
  carrier,
  trackingNumber,
}: {
  orderId: string;
  status: string;
  paymentMethod: string;
  carrier: string;
  trackingNumber: string;
}) {
  const [state, action] = useActionState(advanceOrder, null as OrderActionState);
  const next = NEXT_ORDER_STATUS[status];

  if (!next) {
    return (
      <p className="text-sm text-admin-muted">
        {status === "delivered"
          ? "This order is delivered. Status cannot move backward."
          : "This status cannot be advanced."}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <p className="text-sm text-admin-muted">
        Next step is {next}. Status moves one step at a time and cannot skip or go back.
      </p>
      {next === "shipped" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Carrier
            <input name="carrier" required maxLength={80} defaultValue={carrier} className={fieldClass} />
          </label>
          <label className="block text-sm font-medium">
            Tracking number
            <input
              name="trackingNumber"
              required
              maxLength={64}
              defaultValue={trackingNumber}
              className={fieldClass}
            />
          </label>
        </div>
      ) : null}
      {next === "delivered" && paymentMethod === "cod" ? (
        <p className="text-sm text-admin-muted">Cash on delivery is marked paid when the order is delivered.</p>
      ) : null}
      {state?.error ? (
        <p role="alert" className="rounded-2xl bg-[#fff1f2] px-4 py-3 text-sm text-[#9f1239]">
          {state.error}
        </p>
      ) : null}
      <SubmitButton label={advanceLabel(next as OrderStatus)} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center rounded-full bg-admin-accent px-5 text-sm font-semibold text-white shadow-[0_8px_16px_rgba(255,122,61,0.28)] disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}
