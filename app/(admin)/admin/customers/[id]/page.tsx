import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { formatInr } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const instant = false;

export const metadata = {
  title: "Customer · Wearism Admin",
};

const when = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AdminCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const customer = await prisma.user.findFirst({
    where: { id, role: "customer" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      addresses: {
        orderBy: [{ isDefault: "desc" }, { city: "asc" }],
        select: {
          id: true,
          name: true,
          phone: true,
          line1: true,
          line2: true,
          city: true,
          state: true,
          postalCode: true,
          isDefault: true,
        },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
          _count: { select: { items: true } },
        },
      },
      _count: { select: { orders: true } },
    },
  });

  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/customers" className="text-sm font-medium text-admin-muted hover:text-admin-ink">
        ← Customers
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{customer.name}</h1>
      <p className="mt-1 text-sm text-admin-muted">Read only. Customer since {when.format(customer.createdAt)}.</p>

      <section className="mt-5 rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(28,28,28,0.04)]">
        <h2 className="text-base font-semibold">Contact</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-admin-muted">Email</dt>
            <dd className="mt-1 text-sm">
              <a href={`mailto:${customer.email}`} className="hover:text-admin-accent">
                {customer.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-admin-muted">Phone</dt>
            <dd className="mt-1 text-sm tabular-nums">
              {customer.phone ? (
                <a href={`tel:${customer.phone}`} className="hover:text-admin-accent">
                  {customer.phone}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(28,28,28,0.04)]">
          <h2 className="text-base font-semibold">Addresses</h2>
          {customer.addresses.length === 0 ? (
            <p className="mt-4 text-sm text-admin-muted">No saved addresses.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {customer.addresses.map((address) => (
                <li key={address.id} className="rounded-2xl bg-admin-bg px-4 py-3 text-sm">
                  <p className="font-medium">{address.name}</p>
                  <p className="text-admin-muted tabular-nums">{address.phone}</p>
                  <p className="mt-1">{address.line1}</p>
                  {address.line2 ? <p>{address.line2}</p> : null}
                  <p>
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  {address.isDefault ? (
                    <p className="mt-2 inline-flex rounded-full bg-admin-peach px-2 py-0.5 text-xs font-medium text-admin-accent">
                      Default
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(28,28,28,0.04)]">
          <h2 className="text-base font-semibold">Recent orders</h2>
          {customer._count.orders > customer.orders.length ? (
            <p className="mt-1 text-xs text-admin-muted">Showing the {customer.orders.length} most recent orders.</p>
          ) : null}
          {customer.orders.length === 0 ? (
            <p className="mt-4 text-sm text-admin-muted">No orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-black/[0.06]">
              {customer.orders.map((order) => (
                <li key={order.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium capitalize">{order.status}</p>
                    <p className="text-xs text-admin-muted">
                      {when.format(order.createdAt)} · {order.paymentStatus} ·{" "}
                      {order._count.items === 1 ? "1 item" : `${order._count.items} items`}
                    </p>
                  </div>
                  <p className="font-medium tabular-nums">{formatInr(order.total)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
