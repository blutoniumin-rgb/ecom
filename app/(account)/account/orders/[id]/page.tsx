import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import { formatInr } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { formatOrderDate, parseShipmentEvents, paymentLabel, statusLabel } from "@/components/account/labels";
import { OrderTimeline } from "@/components/account/order-timeline";
import { firstImage } from "@/components/store/product-card";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Order ${id} · Wearism` };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/login?next=/account/orders");

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.userId },
    include: {
      items: { include: { product: { select: { slug: true, imageUrls: true } } } },
      shipment: true,
    },
  });

  if (!order) notFound();

  const events = order.shipment ? parseShipmentEvents(order.shipment.events) : [];

  return (
    <article>
      <p className="text-sm text-muted">
        <Link href="/account/orders" className="font-semibold text-ink underline">
          Orders
        </Link>
      </p>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Order</h1>
      <p className="mt-2 break-all text-sm text-muted">
        {order.id} · {formatOrderDate(order.createdAt)} · {statusLabel(order.status)} · {paymentLabel(order.paymentMethod)}
      </p>

      <div className="mt-8">
        <OrderTimeline status={order.status} />
      </div>

      <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
        {order.items.map((item) => {
          const image = firstImage(item.product.imageUrls);
          return (
            <li key={item.id} className="flex gap-4 py-4">
              <Link
                href={`/product/${item.product.slug}`}
                aria-label={item.name}
                className="h-24 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#f2f2f2]"
              >
                {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : null}
              </Link>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">{item.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {item.sku} · Qty {item.quantity}
                </p>
                <p className="mt-1 text-sm text-ink">
                  {formatInr(item.unitPrice)} · GST {formatInr(item.gstAmount)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-ink">{formatInr(item.unitPrice * item.quantity)}</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-[#f6f6f7] p-5 text-sm">
          <h2 className="font-bold text-ink">Totals</h2>
          <dl className="mt-3 space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-ink">{formatInr(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">GST</dt>
              <dd className="font-semibold text-ink">{formatInr(order.gst)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Total</dt>
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
      </div>

      {order.shipment ? (
        <section className="mt-6 rounded-3xl border border-neutral-200 p-5">
          <h2 className="text-sm font-bold tracking-wide text-ink">Shipment</h2>
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
          ) : null}
        </section>
      ) : null}
    </article>
  );
}
