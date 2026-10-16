import Link from "next/link";
import { formatInr } from "@/lib/format";
import { formatOrderDate, ORDER_STEPS, parseShipmentEvents, statusLabel } from "@/components/account/labels";

const STEPS = ORDER_STEPS;

export type OrderView = {
  id: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  gst: number;
  total: number;
  createdAt: string;
  addressName: string;
  addressPhone: string;
  addressLine1: string;
  addressLine2: string | null;
  addressCity: string;
  addressState: string;
  addressPostal: string;
  items: {
    id: string;
    name: string;
    sku: string;
    slug: string;
    image: string | null;
    unitPrice: number;
    quantity: number;
    gstRate: number;
    gstAmount: number;
  }[];
  shipment: {
    carrier: string;
    trackingNumber: string;
    events: string;
  } | null;
};

function paymentMethodLabel(method: string) {
  if (method === "cod") return "Cash on delivery";
  if (method === "razorpay") return "Pay online";
  if (method === "demo") return "Demo payment";
  return method.replaceAll("_", " ");
}

function paymentStatusLabel(status: string) {
  if (status === "paid") return "Paid";
  if (status === "pending") return "Pending";
  return statusLabel(status);
}

export function OrderConfirmation({ order }: { order: OrderView }) {
  const current = STEPS.findIndex((step) => step.key === order.status);
  const events = order.shipment ? parseShipmentEvents(order.shipment.events) : [];

  return (
    <article className="mt-8">
      <p className="text-xs font-bold tracking-[0.18em] text-muted uppercase">Order placed</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Thank you</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Order number <span className="font-semibold text-ink">{order.id}</span>
        {" · "}
        {formatOrderDate(order.createdAt)}
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-bold tracking-wide text-ink">Status</h2>
        {current < 0 ? (
          <p className="mt-3 text-sm text-ink">
            Current status: <span className="font-bold">{statusLabel(order.status)}</span>
          </p>
        ) : null}
        <ol className="mt-5 grid gap-4 sm:grid-cols-4">
          {STEPS.map((step, index) => {
            const reached = current >= 0 && index <= current;
            const active = current === index;
            return (
              <li key={step.key} className="relative">
                {index < STEPS.length - 1 ? (
                  <span
                    className={
                      current > index
                        ? "absolute top-4 left-8 hidden h-px w-[calc(100%-1rem)] bg-ink sm:block"
                        : "absolute top-4 left-8 hidden h-px w-[calc(100%-1rem)] bg-neutral-200 sm:block"
                    }
                    aria-hidden
                  />
                ) : null}
                <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                  <span
                    className={
                      reached
                        ? "relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white"
                        : "relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f3f3f4] text-xs font-bold text-muted"
                    }
                  >
                    {index + 1}
                  </span>
                  <span className={active ? "text-sm font-bold text-ink" : "text-sm text-muted"}>{step.label}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-bold tracking-wide text-ink">Items</h2>
        <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4">
              <Link
                href={`/product/${item.slug}`}
                aria-label={item.name}
                className="h-24 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#f2f2f2]"
              >
                {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : null}
              </Link>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">{item.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {item.sku} · Qty {item.quantity}
                </p>
                <p className="mt-1 text-sm text-ink">
                  {formatInr(item.unitPrice)} · GST {item.gstRate}% ({formatInr(item.gstAmount)})
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-ink">{formatInr(item.unitPrice * item.quantity)}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl bg-[#f6f6f7] p-5 text-sm">
          <h2 className="font-bold text-ink">GST breakdown</h2>
          <ul className="mt-3 space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="text-muted">
                  {item.name} · {item.gstRate}%
                </span>
                <span className="font-semibold text-ink">{formatInr(item.gstAmount)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-neutral-200 pt-3">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-ink">{formatInr(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">GST</dt>
              <dd className="font-semibold text-ink">{formatInr(order.gst)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-bold text-ink">Total</dt>
              <dd className="font-bold text-ink">{formatInr(order.total)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-3xl border border-neutral-200 p-5 text-sm">
          <h2 className="font-bold text-ink">Deliver to</h2>
          <p className="mt-3 leading-relaxed text-ink">
            {order.addressName}
            <br />
            {order.addressPhone}
            <br />
            {order.addressLine1}
            {order.addressLine2 ? (
              <>
                <br />
                {order.addressLine2}
              </>
            ) : null}
            <br />
            {order.addressCity}, {order.addressState} {order.addressPostal}
          </p>
        </section>

        <section className="rounded-3xl border border-neutral-200 p-5 text-sm">
          <h2 className="font-bold text-ink">Payment</h2>
          <p className="mt-3 text-ink">{paymentMethodLabel(order.paymentMethod)}</p>
          <p className="mt-1 font-semibold text-ink">{paymentStatusLabel(order.paymentStatus)}</p>
        </section>
      </div>

      <section className="mt-6 rounded-3xl border border-neutral-200 p-5">
        <h2 className="text-sm font-bold tracking-wide text-ink">Shipment</h2>
        {order.shipment ? (
          <>
            <p className="mt-3 text-sm text-ink">
              {order.shipment.carrier} · {order.shipment.trackingNumber}
            </p>
            {events.length > 0 ? (
              <ol className="mt-4 space-y-3">
                {events.map((event) => (
                  <li key={`${event.at}-${event.label}`} className="text-sm">
                    <p className="font-semibold text-ink">{event.label}</p>
                    <p className="text-muted">{formatOrderDate(event.at)}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-muted">No tracking events yet.</p>
            )}
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">Not shipped yet.</p>
        )}
      </section>

      <Link href="/shop" className="mt-8 inline-flex text-sm font-bold text-ink underline">
        Continue shopping
      </Link>
    </article>
  );
}
