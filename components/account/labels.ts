const orderDate = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatOrderDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return orderDate.format(date);
}

export function paymentLabel(method: string) {
  if (method === "cod") return "Cash on delivery";
  if (method === "razorpay") return "Razorpay";
  return method.replaceAll("_", " ");
}

export function statusLabel(status: string) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export type ShipmentEvent = {
  at: string;
  label: string;
};

export function parseShipmentEvents(raw: string): ShipmentEvent[] {
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

export const ORDER_STEPS = [
  { key: "placed", label: "Placed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
] as const;
