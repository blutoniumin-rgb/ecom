import Link from "next/link";
import { connection } from "next/server";
import { OrdersToolbar, PaymentPill, StatusPill } from "@/components/admin/orders-toolbar";
import {
  formatAdminDate,
  parseOrderListQuery,
  paymentMethodLabel,
  statusLabel,
} from "@/components/admin/orders-query";
import { formatInr } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const instant = false;

export const metadata = {
  title: "Orders · Wearism Admin",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const query = parseOrderListQuery(await searchParams);
  const email = query.q.toLowerCase();
  const orders = await prisma.order.findMany({
    where: {
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { id: { contains: query.q } },
              { user: { email: { contains: query.q } } },
              ...(email !== query.q ? [{ user: { email: { contains: email } } }] : []),
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      total: true,
      paymentMethod: true,
      paymentStatus: true,
      status: true,
      user: { select: { name: true, email: true } },
    },
  });

  const filtered = Boolean(query.q || query.status);

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_8px_30px_rgba(28,28,28,0.04)] sm:p-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-admin-muted">
            {orders.length === 1 ? "1 order" : `${orders.length} orders`}
            {query.status ? ` · ${statusLabel(query.status)}` : ""}
          </p>
        </div>
      </div>
      <OrdersToolbar query={query} />
      {orders.length === 0 ? (
        <p className="px-2 py-16 text-center text-sm text-admin-muted">
          {filtered ? "No orders match this search." : "No orders yet."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto border-t border-black/[0.06] pt-4">
          <table className="w-full min-w-[920px] text-left text-sm">
            <caption className="sr-only">Orders</caption>
            <thead>
              <tr className="text-xs font-medium text-admin-muted">
                <th scope="col" className="px-3 py-3 font-medium">
                  Order
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Customer
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Total
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Payment
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Payment status
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-black/[0.06]">
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium break-all hover:text-admin-accent"
                    >
                      {order.id}
                    </Link>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{formatAdminDate(order.createdAt)}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium">{order.user.name}</p>
                    <p className="text-xs text-admin-muted">{order.user.email}</p>
                  </td>
                  <td className="px-3 py-3 font-medium whitespace-nowrap tabular-nums">{formatInr(order.total)}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{paymentMethodLabel(order.paymentMethod)}</td>
                  <td className="px-3 py-3">
                    <PaymentPill status={order.paymentStatus} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
