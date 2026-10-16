import { Prisma } from "@prisma/client";
import { gstAmount, gstRateForPrice, type GstBands } from "@/lib/gst";
import { getCartView } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

const FALLBACK_BANDS: GstBands = {
  gstThreshold: 1000,
  gstLowRate: 5,
  gstHighRate: 12,
};

export class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type QuotedLine = {
  productId: string;
  size: string;
  quantity: number;
  name: string;
  sku: string;
  slug: string;
  imageUrls: string;
  unitPrice: number;
  gstRate: number;
  gstAmount: number;
  lineTotal: number;
  stock: number;
};

export type AddressSnap = {
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
};

export async function loadBands(): Promise<GstBands> {
  const setting = await prisma.storeSetting.findUnique({ where: { id: "singleton" } });
  if (!setting) return FALLBACK_BANDS;
  return {
    gstThreshold: setting.gstThreshold,
    gstLowRate: setting.gstLowRate,
    gstHighRate: setting.gstHighRate,
  };
}

export function razorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() ?? "";
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

export async function quoteCart(): Promise<{
  lines: QuotedLine[];
  unavailable: string[];
  subtotal: number;
  gst: number;
  total: number;
  bands: GstBands;
}> {
  const [view, bands] = await Promise.all([getCartView(), loadBands()]);
  const ids = [...new Set(view.lines.map((line) => line.productId))];
  const products = ids.length
    ? await prisma.product.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          sku: true,
          stock: true,
          active: true,
          price: true,
          name: true,
          slug: true,
          imageUrls: true,
        },
      })
    : [];
  const byId = new Map(products.map((product) => [product.id, product]));
  const lines: QuotedLine[] = [];
  const unavailable: string[] = [];

  for (const line of view.lines) {
    const product = byId.get(line.productId);
    if (!product || !product.active) {
      unavailable.push(line.name);
      continue;
    }
    const unitGst = gstAmount(product.price, bands);
    lines.push({
      productId: product.id,
      size: line.size,
      quantity: line.quantity,
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      imageUrls: product.imageUrls,
      unitPrice: product.price,
      gstRate: gstRateForPrice(product.price, bands),
      gstAmount: unitGst * line.quantity,
      lineTotal: product.price * line.quantity,
      stock: product.stock,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const gst = lines.reduce((sum, line) => sum + line.gstAmount, 0);
  return { lines, unavailable, subtotal, gst, total: subtotal + gst, bands };
}

export function stockProblems(lines: QuotedLine[]) {
  const need = new Map<string, { name: string; quantity: number; stock: number }>();
  for (const line of lines) {
    const current = need.get(line.productId);
    if (current) current.quantity += line.quantity;
    else need.set(line.productId, { name: line.name, quantity: line.quantity, stock: line.stock });
  }
  const problems: string[] = [];
  for (const item of need.values()) {
    if (item.quantity > item.stock) {
      problems.push(
        item.stock < 1
          ? `${item.name} is out of stock.`
          : `Only ${item.stock} of ${item.name} left, and your bag has ${item.quantity}.`,
      );
    }
  }
  return problems;
}

export async function decrementStock(
  tx: Prisma.TransactionClient,
  lines: { productId: string; name: string; quantity: number }[],
) {
  const need = new Map<string, { name: string; quantity: number }>();
  for (const line of lines) {
    const current = need.get(line.productId);
    if (current) current.quantity += line.quantity;
    else need.set(line.productId, { name: line.name, quantity: line.quantity });
  }

  for (const [productId, item] of need) {
    const updated = await tx.product.updateMany({
      where: { id: productId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    });
    if (updated.count !== 1) {
      throw new CheckoutError(`Not enough stock for ${item.name}.`, 409);
    }
  }
}

function field(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text || text.length > max) return null;
  return text;
}

export function parseAddress(value: unknown): AddressSnap | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const name = field(raw.name, 80);
  const phone = field(raw.phone, 20);
  const line1 = field(raw.line1, 160);
  const city = field(raw.city, 80);
  const state = field(raw.state, 80);
  const postalCode = field(raw.postalCode, 12);
  if (!name || !phone || !line1 || !city || !state || !postalCode) return null;
  const line2Raw = typeof raw.line2 === "string" ? raw.line2.trim() : "";
  if (line2Raw.length > 160) return null;
  return {
    name,
    phone,
    line1,
    line2: line2Raw || null,
    city,
    state,
    postalCode,
  };
}

export async function resolveAddress(
  userId: string,
  addressId: unknown,
  address: unknown,
  saveAddress: unknown,
): Promise<AddressSnap> {
  if (typeof addressId === "string" && addressId) {
    const saved = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!saved) throw new CheckoutError("Choose a saved address.");
    return {
      name: saved.name,
      phone: saved.phone,
      line1: saved.line1,
      line2: saved.line2,
      city: saved.city,
      state: saved.state,
      postalCode: saved.postalCode,
    };
  }

  const next = parseAddress(address);
  if (!next) throw new CheckoutError("Check the address fields.");

  if (saveAddress === true) {
    const existing = await prisma.address.count({ where: { userId } });
    const isDefault = existing === 0;
    await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      await tx.address.create({
        data: {
          userId,
          name: next.name,
          phone: next.phone,
          line1: next.line1,
          line2: next.line2,
          city: next.city,
          state: next.state,
          postalCode: next.postalCode,
          isDefault,
        },
      });
    });
  }

  return next;
}

export function orderCreateData(
  userId: string,
  lines: QuotedLine[],
  address: AddressSnap,
  paymentMethod: string,
  paymentStatus: string,
) {
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const gst = lines.reduce((sum, line) => sum + line.gstAmount, 0);
  return {
    userId,
    status: "placed",
    paymentMethod,
    paymentStatus,
    subtotal,
    gst,
    total: subtotal + gst,
    addressName: address.name,
    addressPhone: address.phone,
    addressLine1: address.line1,
    addressLine2: address.line2,
    addressCity: address.city,
    addressState: address.state,
    addressPostal: address.postalCode,
    items: {
      create: lines.map((line) => ({
        productId: line.productId,
        name: line.name,
        sku: line.sku,
        unitPrice: line.unitPrice,
        quantity: line.quantity,
        gstRate: line.gstRate,
        gstAmount: line.gstAmount,
      })),
    },
  };
}
