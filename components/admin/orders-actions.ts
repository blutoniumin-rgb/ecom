"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NEXT_ORDER_STATUS, type OrderStatus } from "@/components/admin/orders-query";
import { prisma } from "@/lib/prisma";

export type OrderActionState = { error: string } | null;

type ShipmentEvent = { at: string; label: string };

class OrderAdvanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderAdvanceError";
  }
}

function parseEvents(raw: string | null | undefined): ShipmentEvent[] {
  if (!raw) return [];
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

export async function advanceOrder(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const id = String(formData.get("orderId") ?? "").trim();
  if (!id) return { error: "This order is missing." };

  let advanced: OrderStatus | null = null;

  try {
    advanced = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { shipment: true },
      });
      if (!order) throw new OrderAdvanceError("This order no longer exists.");

      const next = NEXT_ORDER_STATUS[order.status];
      if (!next) throw new OrderAdvanceError("Delivered orders stay delivered.");

      let carrier = "";
      let trackingNumber = "";
      if (next === "shipped") {
        carrier = String(formData.get("carrier") ?? "")
          .trim()
          .replace(/\s+/g, " ");
        trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
        if (!carrier) throw new OrderAdvanceError("Enter a carrier to mark this order shipped.");
        if (!trackingNumber) {
          throw new OrderAdvanceError("Enter a tracking number to mark this order shipped.");
        }
        if (carrier.length > 80) throw new OrderAdvanceError("Carrier must be 80 characters or fewer.");
        if (trackingNumber.length > 64) {
          throw new OrderAdvanceError("Tracking number must be 64 characters or fewer.");
        }
      }

      if (next === "delivered" && !order.shipment) {
        throw new OrderAdvanceError("This order has no shipment, so it cannot be marked delivered.");
      }

      const updated = await tx.order.updateMany({
        where: { id, status: order.status },
        data: {
          status: next,
          ...(next === "delivered" && order.paymentMethod === "cod" ? { paymentStatus: "paid" } : {}),
        },
      });
      if (updated.count !== 1) {
        throw new OrderAdvanceError("This order changed. Refresh and try again.");
      }

      const at = new Date().toISOString();
      if (next === "shipped") {
        const events = [...parseEvents(order.shipment?.events), { at, label: "Shipped" }];
        await tx.shipment.upsert({
          where: { orderId: id },
          create: {
            orderId: id,
            carrier,
            trackingNumber,
            events: JSON.stringify([{ at, label: "Shipped" }]),
          },
          update: {
            carrier,
            trackingNumber,
            events: JSON.stringify(events),
          },
        });
      }

      if (next === "delivered" && order.shipment) {
        const events = [...parseEvents(order.shipment.events), { at, label: "Delivered" }];
        await tx.shipment.update({
          where: { orderId: id },
          data: { events: JSON.stringify(events) },
        });
      }

      return next;
    });
  } catch (error) {
    if (error instanceof OrderAdvanceError) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/reports/gst");
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${id}`);
  redirect(`/admin/orders/${id}?notice=${advanced}`);
}
