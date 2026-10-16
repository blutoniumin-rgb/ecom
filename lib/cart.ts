"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CART_COOKIE = "wearism_cart";

type CartLine = {
  productId: string;
  size: string;
  quantity: number;
};

export type CartViewLine = {
  productId: string;
  size: string;
  quantity: number;
  name: string;
  slug: string;
  price: number;
  imageUrls: string;
  lineTotal: number;
};

const tails = new Map<string, Promise<void>>();

function cartCookieOptions(maxAge: number) {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge,
  };
}

function lineKey(productId: string, size: string) {
  return `${productId}\u0000${size}`;
}

function parseCart(raw: string | undefined): CartLine[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const line = item as Partial<CartLine>;
      if (typeof line.productId !== "string" || typeof line.size !== "string") return [];
      const quantity = Number(line.quantity);
      if (!Number.isFinite(quantity) || quantity < 1) return [];
      return [
        {
          productId: line.productId,
          size: line.size,
          quantity: Math.floor(quantity),
        },
      ];
    });
  } catch {
    return [];
  }
}

function combineLines(base: CartLine[], extra: CartLine[]): CartLine[] {
  const merged = new Map<string, CartLine>();
  for (const line of [...base, ...extra]) {
    const key = lineKey(line.productId, line.size);
    const existing = merged.get(key);
    if (existing) existing.quantity += line.quantity;
    else merged.set(key, { ...line });
  }
  return [...merged.values()];
}

function countLines(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

async function readCart(): Promise<CartLine[]> {
  const store = await cookies();
  return parseCart(store.get(CART_COOKIE)?.value);
}

async function writeCart(lines: CartLine[]) {
  const store = await cookies();
  if (lines.length === 0) {
    store.set(CART_COOKIE, "", cartCookieOptions(0));
    return;
  }
  store.set(CART_COOKIE, JSON.stringify(lines), cartCookieOptions(60 * 60 * 24 * 30));
}

function enqueue(userId: string, task: () => Promise<void>) {
  const prev = tails.get(userId) ?? Promise.resolve();
  const run = prev.then(task, task);
  tails.set(
    userId,
    run.then(
      () => undefined,
      () => undefined,
    ),
  );
  return run;
}

async function ensureCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

async function collapseCartItems(cartId: string) {
  const items = await prisma.cartItem.findMany({ where: { cartId } });
  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    const key = lineKey(item.productId, item.size);
    const group = grouped.get(key) ?? [];
    group.push(item);
    grouped.set(key, group);
  }

  for (const group of grouped.values()) {
    if (group.length < 2) continue;
    const [keep, ...rest] = group;
    if (!keep) continue;
    await prisma.cartItem.update({
      where: { id: keep.id },
      data: { quantity: group.reduce((sum, item) => sum + item.quantity, 0) },
    });
    await prisma.cartItem.deleteMany({ where: { id: { in: rest.map((item) => item.id) } } });
  }
}

async function mergeCookieIntoUser(userId: string) {
  const store = await cookies();
  const lines = parseCart(store.get(CART_COOKIE)?.value);
  if (lines.length === 0) return;

  store.set(CART_COOKIE, "", cartCookieOptions(0));

  const productIds = [...new Set(lines.map((line) => line.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true },
  });
  const validIds = new Set(products.map((product) => product.id));
  const validLines = lines.filter((line) => validIds.has(line.productId));
  if (validLines.length === 0) return;

  const cart = await ensureCart(userId);
  await collapseCartItems(cart.id);
  const items = await prisma.cartItem.findMany({ where: { cartId: cart.id } });

  for (const line of validLines) {
    const existing = items.find((item) => item.productId === line.productId && item.size === line.size);
    if (existing) {
      existing.quantity += line.quantity;
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity },
      });
    } else {
      const created = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: line.productId,
          size: line.size,
          quantity: line.quantity,
        },
      });
      items.push(created);
    }
  }
}

async function userLines(userId: string): Promise<CartLine[]> {
  const items = await prisma.cartItem.findMany({
    where: { cart: { userId } },
    select: { productId: true, size: true, quantity: true },
  });
  return items;
}

function refreshCart() {
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function getCartCount(): Promise<number> {
  const session = await getSession();
  const cookieLines = await readCart();
  if (!session) return countLines(cookieLines);
  const stored = await userLines(session.userId);
  return countLines(combineLines(stored, cookieLines));
}

export async function addToCart(input: {
  productId: string;
  size: string;
  quantity: number;
}): Promise<number> {
  const productId = input.productId.trim();
  const size = input.size.trim();
  const quantity = Math.max(1, Math.min(10, Math.floor(Number(input.quantity) || 1)));
  const session = await getSession();

  if (session) {
    if (productId && size) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true },
      });
      if (product) {
        await enqueue(session.userId, async () => {
          await mergeCookieIntoUser(session.userId);
          const cart = await ensureCart(session.userId);
          await collapseCartItems(cart.id);
          const existing = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId, size },
          });
          if (existing) {
            await prisma.cartItem.update({
              where: { id: existing.id },
              data: { quantity: existing.quantity + quantity },
            });
          } else {
            await prisma.cartItem.create({
              data: { cartId: cart.id, productId, size, quantity },
            });
          }
        });
        refreshCart();
      }
    }
    return getCartCount();
  }

  const lines = await readCart();

  if (productId && size) {
    const existing = lines.find((line) => line.productId === productId && line.size === size);
    if (existing) existing.quantity += quantity;
    else lines.push({ productId, size, quantity });
    await writeCart(lines);
  }

  return countLines(lines);
}

export async function getCartView(): Promise<{
  lines: CartViewLine[];
  subtotal: number;
  needsSync: boolean;
}> {
  const session = await getSession();
  const cookieLines = await readCart();
  const stored = session ? await userLines(session.userId) : [];
  const merged = session ? combineLines(stored, cookieLines) : cookieLines;
  const ids = [...new Set(merged.map((line) => line.productId))];
  const products = ids.length
    ? await prisma.product.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, slug: true, price: true, imageUrls: true },
      })
    : [];
  const byId = new Map(products.map((product) => [product.id, product]));

  const lines: CartViewLine[] = [];
  for (const line of merged) {
    const product = byId.get(line.productId);
    if (!product) continue;
    lines.push({
      productId: line.productId,
      size: line.size,
      quantity: line.quantity,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrls: product.imageUrls,
      lineTotal: product.price * line.quantity,
    });
  }

  return {
    lines,
    subtotal: lines.reduce((sum, line) => sum + line.lineTotal, 0),
    needsSync: Boolean(session && cookieLines.length > 0),
  };
}

export async function persistGuestCart() {
  const session = await getSession();
  if (!session) return;
  await enqueue(session.userId, () => mergeCookieIntoUser(session.userId));
  refreshCart();
}

export async function setCartQuantity(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();
  const quantity = Math.floor(Number(formData.get("quantity")));
  if (!productId || !size || !Number.isFinite(quantity)) return;

  const session = await getSession();
  if (session) {
    await enqueue(session.userId, async () => {
      await mergeCookieIntoUser(session.userId);
      const cart = await ensureCart(session.userId);
      await collapseCartItems(cart.id);
      if (quantity < 1) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId, size } });
        return;
      }
      const item = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId, size },
      });
      if (!item) return;
      const nextQuantity = quantity > item.quantity ? Math.min(99, quantity) : quantity;
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: nextQuantity },
      });
    });
  } else {
    const lines = await readCart();
    const next = lines.flatMap((line) => {
      if (line.productId !== productId || line.size !== size) return [line];
      if (quantity < 1) return [];
      const nextQuantity = quantity > line.quantity ? Math.min(99, quantity) : quantity;
      return [{ ...line, quantity: nextQuantity }];
    });
    await writeCart(next);
  }

  refreshCart();
}

export async function removeCartLine(formData: FormData) {
  formData.set("quantity", "0");
  await setCartQuantity(formData);
}

export async function clearCart() {
  const session = await getSession();
  if (session) {
    await enqueue(session.userId, async () => {
      await prisma.cartItem.deleteMany({ where: { cart: { userId: session.userId } } });
    });
  }
  await writeCart([]);
  refreshCart();
  revalidatePath("/checkout");
}
