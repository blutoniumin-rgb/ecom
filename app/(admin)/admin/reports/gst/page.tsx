import { connection } from "next/server";
import { GstFilters } from "@/components/admin/gst-filters";
import { parseGstRange } from "@/components/admin/gst-query";
import { formatAdminDate } from "@/components/admin/orders-query";
import { formatInr } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const instant = false;

export const metadata = {
  title: "GST invoices · Wearism Admin",
};

export default async function AdminGstReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const { range, error } = parseGstRange(await searchParams);
  const orders = error
    ? []
    : await prisma.order.findMany({
        where: { createdAt: { gte: range.start, lte: range.end } },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          createdAt: true,
          subtotal: true,
          gst: true,
          total: true,
          user: { select: { name: true, email: true } },
        },
      });

  const taxable = orders.reduce((sum, order) => sum + order.subtotal, 0);
  const gst = orders.reduce((sum, order) => sum + order.gst, 0);
  const total = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_8px_30px_rgba(28,28,28,0.04)] sm:p-6 print:rounded-none print:shadow-none">
      <style>{`
        @media print {
          aside, header { display: none !important; }
          main { padding: 0 !important; }
          body { background: white !important; }
        }
      `}</style>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-admin-accent uppercase">Wearism</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">GST invoices</h1>
          <p className="mt-1 text-sm text-admin-muted">
            {formatAdminDate(range.start)} – {formatAdminDate(range.end)} · Asia/Kolkata
          </p>
        </div>
        <GstFilters from={range.from} to={range.to} />
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-2xl bg-[#fff1f2] px-4 py-3 text-sm text-[#9f1239]">
          {error}
        </p>
      ) : null}

      {orders.length === 0 && !error ? (
        <p className="px-2 py-16 text-center text-sm text-admin-muted">No orders in this range.</p>
      ) : null}

      {orders.length > 0 ? (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <caption className="sr-only">GST invoices for the selected dates</caption>
            <thead>
              <tr className="text-xs font-medium text-admin-muted">
                <th scope="col" className="border-b border-black/[0.08] px-3 py-3 font-medium">
                  Order
                </th>
                <th scope="col" className="border-b border-black/[0.08] px-3 py-3 font-medium">
                  Date
                </th>
                <th scope="col" className="border-b border-black/[0.08] px-3 py-3 font-medium">
                  Customer
                </th>
                <th scope="col" className="border-b border-black/[0.08] px-3 py-3 text-right font-medium">
                  Taxable value
                </th>
                <th scope="col" className="border-b border-black/[0.08] px-3 py-3 text-right font-medium">
                  GST
                </th>
                <th scope="col" className="border-b border-black/[0.08] px-3 py-3 text-right font-medium">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-black/[0.06]">
                  <td className="px-3 py-3 font-medium break-all">{order.id}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{formatAdminDate(order.createdAt)}</td>
                  <td className="px-3 py-3">
                    <p>{order.user.name}</p>
                    <p className="text-xs text-admin-muted">{order.user.email}</p>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatInr(order.subtotal)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatInr(order.gst)}</td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums">{formatInr(order.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="text-sm font-semibold">
                <th scope="row" colSpan={3} className="px-3 py-4 text-left">
                  Totals
                </th>
                <td className="px-3 py-4 text-right tabular-nums">{formatInr(taxable)}</td>
                <td className="px-3 py-4 text-right tabular-nums">{formatInr(gst)}</td>
                <td className="px-3 py-4 text-right tabular-nums">{formatInr(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : null}
    </section>
  );
}
