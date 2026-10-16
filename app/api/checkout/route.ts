import { connection } from "next/server";
import { clearCart } from "@/lib/cart";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CheckoutError,
  decrementStock,
  orderCreateData,
  quoteCart,
  razorpayKeys,
  resolveAddress,
  stockProblems,
} from "@/app/api/checkout/quote";

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  await connection();
  try {
    const session = await getSession();
    if (!session) return json({ error: "Sign in to checkout." }, 401);

    const body = (await request.json()) as {
      payment?: unknown;
      addressId?: unknown;
      address?: unknown;
      saveAddress?: unknown;
    };
    if (body.payment !== "cod" && body.payment !== "online") {
      throw new CheckoutError("Choose cash on delivery or pay online.");
    }

    const quote = await quoteCart();
    if (quote.unavailable.length > 0) {
      throw new CheckoutError(`${quote.unavailable.join(", ")} is no longer available.`);
    }
    if (quote.lines.length === 0) throw new CheckoutError("Your bag is empty.");
    const problems = stockProblems(quote.lines);
    if (problems.length > 0) throw new CheckoutError(problems.join(" "), 409);

    const address = await resolveAddress(session.userId, body.addressId, body.address, body.saveAddress);
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, phone: true },
    });

    if (body.payment === "cod") {
      const order = await prisma.$transaction(async (tx) => {
        await decrementStock(tx, quote.lines);
        return tx.order.create({ data: orderCreateData(session.userId, quote.lines, address, "cod", "pending") });
      });
      await clearCart();
      return json({ mode: "redirect", orderId: order.id });
    }

    const keys = razorpayKeys();
    if (!keys) {
      const order = await prisma.$transaction(async (tx) => {
        await decrementStock(tx, quote.lines);
        return tx.order.create({ data: orderCreateData(session.userId, quote.lines, address, "demo", "paid") });
      });
      await clearCart();
      return json({ mode: "redirect", orderId: order.id });
    }

    const order = await prisma.order.create({
      data: orderCreateData(session.userId, quote.lines, address, "razorpay", "pending"),
    });

    const auth = Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString("base64");
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: order.total * 100,
        currency: "INR",
        receipt: order.id,
        notes: { orderId: order.id },
      }),
    });
    const razorpayOrder = (await razorpayResponse.json().catch(() => null)) as {
      id?: string;
      error?: { description?: string };
    } | null;

    if (!razorpayResponse.ok || !razorpayOrder?.id) {
      await prisma.order.delete({ where: { id: order.id } });
      throw new CheckoutError(razorpayOrder?.error?.description || "Razorpay could not start the payment.", 502);
    }

    return json({
      mode: "razorpay",
      orderId: order.id,
      keyId: keys.keyId,
      razorpayOrderId: razorpayOrder.id,
      amount: order.total * 100,
      currency: "INR",
      name: "Wearism",
      description: `Order ${order.id}`,
      prefill: {
        name: user?.name || session.name,
        email: user?.email || session.email,
        contact: address.phone || user?.phone || "",
      },
    });
  } catch (error) {
    if (error instanceof CheckoutError) return json({ error: error.message }, error.status);
    return json({ error: "Checkout could not be completed." }, 500);
  }
}
