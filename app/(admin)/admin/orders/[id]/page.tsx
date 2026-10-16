import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { OrderStatusControl } from "@/components/admin/orders-status";
import { PaymentPill, StatusPill } from "@/components/admin/orders-toolbar";
import {
  formatAdminDate,
  parseOrderListQuery,
  paymentMethodLabel,
  paymentStatusLabel,
  statusLabel,
} from "@/components/admin/orders-query";
import { formatInr } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const instant = false;

export const metadata = {
  title: "Order · Wearism Admin",
};

type ShipmentEvent = { at: string; label: string };

function parseEvents(raw: string): ShipmentEvent[] {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const event = item as Partial<ShipmentEvent>;
      if (typeof event.at !== "string" || typeof event.label !== "string") return [];
      return [{ at: event.at, label: event.label }];
    });
  } catch {
    return [];
  }
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const { id } = await params;
  const notice = parseOrderListQuery(await searchParams).notice;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: { orderBy: { name: "asc" } },
      shipment: true,
    },
  });

  if (!order) notFound();

  const events = order.shipment ? parseEvents(order.shipment.events) : [];
  const noticeText =
    notice === "shipped"
      ? "Order marked shipped."
      : notice === "delivered"
        ? "Order marked delivered."
        : notice === "processing"
          ? "Order marked processing."
          : notice === "placed"
            ? "Order updated."
            : "";

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <Link href="/admin/orders" className="text-sm font-medium text-admin-muted hover:text-admin-ink">
          ← Orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Order</h1>
          <StatusPill status={order.status} />
          <PaymentPill status={order.paymentStatus} />
        </div>
        <p className="mt-2 text-sm break-all text-admin-muted">
          {order.id} · {formatAdminDate(order.createdAt)}
        </p>
      </div>

      {noticeText ? (
        <p role="status" className="rounded-2xl bg-[#ecfdf3] px-4 py-3 text-sm text-[#166534]">
          {noticeText}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(28,28,28,0.04)]">
          <h2 className="text-base font-semibold">Customer</h2>
          <p className="mt-3 text-sm font-medium">{order.user.name}</p>
          <p className="mt-1 text-sm text-admin-muted">{order.user.email}</p>
          {order.user.phone ? <p className="mt-1 text-sm text-admin-muted">{order.user.phone}</p> : null}
        </section>
        <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(28,28,28,0.04)]">
          <h2 className="text-base font-semibold">Address</h2>
          <p className="mt-3 text-sm leading-relaxed">
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
        <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(28,28,28,0.04)]">
          <h2 className="text-base font-semibold">Payment</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-admin-muted">Method</dt>
              <dd className="font-medium">{paymentMethodLabel(order.paymentMethod)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-admin-muted">Status</dt>
              <dd className="font-medium">{paymentStatusLabel(order.paymentStatus)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(28,28,28,0.04)] sm:p-6">
        <h2 className="text-base font-semibold">Items</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Line items</caption>
            <thead>
              <tr className="text-xs font-medium text-admin-muted">
                <th scope="col" className="px-3 py-3 font-medium">
                  Item
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Qty
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Price
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  GST rate
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  GST
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Line
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-t border-black/[0.06]">
                  <td className="px-3 py-3">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-admin-muted">{item.sku}</p>
                  </td>
                  <td className="px-3 py-3 tabular-nums">{item.quantity}</td>
                  <td className="px-3 py-3 tabular-nums">{formatInr(item.unitPrice)}</td>
                  <td className="px-3 py-3 tabular-nums">{item.gstRate}%</td>
                  <td className="px-3 py-3 tabular-nums">{formatInr(item.gstAmount)}</td>
                  <td className="px-3 py-3 font-medium tabular-nums">
                    {formatInr(item.unitPrice * item.quantity + item.gstAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="mt-4 ml-auto max-w-xs space-y-2 border-t border-black/[0.06] pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-admin-muted">Subtotal</dt>
            <dd className="font-medium tabular-nums">{formatInr(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-admin-muted">GST</dt>
            <dd className="font-medium tabular-nums">{formatInr(order.gst)}</dd>
          </div>
          <div className="flex justify-between text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="font-semibold tabular-nums">{formatInr(order.total)}</dd>
          </div>
        </dl>
      </section>

      {order.shipment ? (
        <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(28,28,28,0.04)]">
          <h2 className="text-base font-semibold">Shipment</h2>
          <p className="mt-3 text-sm">
            {order.shipment.carrier} · {order.shipment.trackingNumber}
          </p>
          {events.length > 0 ? (
            <ol className="mt-4 space-y-3">
              {events.map((event) => (
                <li key={`${event.at}-${event.label}`} className="text-sm">
                  <p className="font-medium">{event.label}</p>
                  <p className="text-admin-muted">{formatAdminDate(event.at)}</p>
                </li>
              ))}
            </ol>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(28,28,28,0.04)]">
        <h2 className="text-base font-semibold">Status</h2>
        <p className="mt-1 text-sm text-admin-muted">Current status: {statusLabel(order.status)}.</p>
        <div className="mt-4">
          <OrderStatusControl
            orderId={order.id}
            status={order.status}
            paymentMethod={order.paymentMethod}
            carrier={order.shipment?.carrier ?? ""}
            trackingNumber={order.shipment?.trackingNumber ?? ""}
          />
        </div>
      </section>
    </div>
  );
}
