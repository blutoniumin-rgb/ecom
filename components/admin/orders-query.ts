export const ORDER_STATUSES = ["placed", "processing", "shipped", "delivered"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const NEXT_ORDER_STATUS: Record<string, OrderStatus | undefined> = {
  placed: "processing",
  processing: "shipped",
  shipped: "delivered",
};

export type OrderListQuery = {
  q: string;
  status: "" | OrderStatus;
  notice: "" | OrderStatus;
};

const STATUS_SET = new Set<string>(ORDER_STATUSES);

const adminDate = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  year: "numeric",
});

function one(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}

export function parseOrderListQuery(
  raw: Record<string, string | string[] | undefined>,
): OrderListQuery {
  const status = one(raw.status);
  const notice = one(raw.notice);
  return {
    q: one(raw.q).slice(0, 120),
    status: STATUS_SET.has(status) ? (status as OrderStatus) : "",
    notice: STATUS_SET.has(notice) ? (notice as OrderStatus) : "",
  };
}

export function ordersHref(query: Pick<OrderListQuery, "q" | "status">, patch: Partial<OrderListQuery> = {}): string {
  const next = { q: query.q, status: query.status, ...patch };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.status) params.set("status", next.status);
  const search = params.toString();
  return search ? `/admin/orders?${search}` : "/admin/orders";
}

export function statusLabel(status: string): string {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function paymentMethodLabel(method: string): string {
  if (method === "cod") return "Cash on delivery";
  if (method === "razorpay") return "Razorpay";
  return method;
}

export function paymentStatusLabel(status: string): string {
  if (status === "paid") return "Paid";
  if (status === "pending") return "Pending";
  return status;
}

export function formatAdminDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return adminDate.format(date);
}

export function advanceLabel(next: OrderStatus): string {
  if (next === "processing") return "Mark processing";
  if (next === "shipped") return "Mark shipped";
  return "Mark delivered";
}
