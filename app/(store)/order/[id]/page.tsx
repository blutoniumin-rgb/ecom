import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { firstImage } from "@/components/store/product-card";
import { OrderConfirmation } from "@/components/store/order-confirmation";

export const instant = false;

export const metadata = {
  title: "Order · Wearism",
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const session = await getSession();
  if (!session) notFound();

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.userId },
    include: {
      items: { include: { product: { select: { slug: true, imageUrls: true } } } },
      shipment: true,
    },
  });
  if (!order) notFound();

  return (
    <OrderConfirmation
      order={{
        id: order.id,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        gst: order.gst,
        total: order.total,
        createdAt: order.createdAt.toISOString(),
        addressName: order.addressName,
        addressPhone: order.addressPhone,
        addressLine1: order.addressLine1,
        addressLine2: order.addressLine2,
        addressCity: order.addressCity,
        addressState: order.addressState,
        addressPostal: order.addressPostal,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          slug: item.product.slug,
          image: firstImage(item.product.imageUrls) ?? null,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          gstRate: item.gstRate,
          gstAmount: item.gstAmount,
        })),
        shipment: order.shipment
          ? {
              carrier: order.shipment.carrier,
              trackingNumber: order.shipment.trackingNumber,
              events: order.shipment.events,
            }
          : null,
      }}
    />
  );
}
