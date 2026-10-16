import { createHmac, timingSafeEqual } from "node:crypto";
import { connection } from "next/server";
import { clearCart } from "@/lib/cart";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutError, decrementStock, razorpayKeys } from "@/app/api/checkout/quote";

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

function signaturesMatch(expected: string, signature: string) {
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  await connection();
  try {
    const session = await getSession();
    if (!session) return json({ error: "Sign in to checkout." }, 401);

    const keys = razorpayKeys();
    if (!keys) throw new CheckoutError("Online payment is in demo mode.", 400);

    const body = (await request.json()) as {
      orderId?: unknown;
      razorpay_order_id?: unknown;
      razorpay_payment_id?: unknown;
      razorpay_signature?: unknown;
    };
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    const razorpayOrderId = typeof body.razorpay_order_id === "string" ? body.razorpay_order_id : "";
    const razorpayPaymentId = typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
    const razorpaySignature = typeof body.razorpay_signature === "string" ? body.razorpay_signature : "";
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new CheckoutError("Payment confirmation is incomplete.");
    }

    const expected = createHmac("sha256", keys.keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    if (!signaturesMatch(expected, razorpaySignature)) {
      throw new CheckoutError("Payment signature did not match.", 400);
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.userId },
      include: { items: true },
    });
    if (!order || order.paymentMethod !== "razorpay") throw new CheckoutError("Order not found.", 404);
    if (order.paymentStatus === "paid") return json({ orderId: order.id });

    const auth = Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString("base64");
    const razorpayResponse = await fetch(`https://api.razorpay.com/v1/orders/${razorpayOrderId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const razorpayOrder = (await razorpayResponse.json().catch(() => null)) as {
      amount?: number;
      currency?: string;
      receipt?: string;
    } | null;
    if (
      !razorpayResponse.ok ||
      !razorpayOrder ||
      razorpayOrder.receipt !== order.id ||
      razorpayOrder.currency !== "INR" ||
      razorpayOrder.amount !== order.total * 100
    ) {
      throw new CheckoutError("Payment does not match this order.", 400);
    }

    await prisma.$transaction(async (tx) => {
      const fresh = await tx.order.findFirst({
        where: { id: order.id, userId: session.userId },
        include: { items: true },
      });
      if (!fresh) throw new CheckoutError("Order not found.", 404);
      if (fresh.paymentStatus === "paid") return;
      await decrementStock(tx, fresh.items);
      await tx.order.update({ where: { id: fresh.id }, data: { paymentStatus: "paid" } });
    });
    await clearCart();
    return json({ orderId: order.id });
  } catch (error) {
    if (error instanceof CheckoutError) return json({ error: error.message }, error.status);
    return json({ error: "Payment could not be confirmed." }, 500);
  }
}
