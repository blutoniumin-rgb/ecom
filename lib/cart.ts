"use server";

import { cookies } from "next/headers";

const CART_COOKIE = "wearism_cart";

type CartLine = {
  productId: string;
  size: string;
  quantity: number;
};

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

async function readCart(): Promise<CartLine[]> {
  const store = await cookies();
  return parseCart(store.get(CART_COOKIE)?.value);
}

export async function getCartCount(): Promise<number> {
  const lines = await readCart();
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export async function addToCart(input: {
  productId: string;
  size: string;
  quantity: number;
}): Promise<number> {
  const productId = input.productId.trim();
  const size = input.size.trim();
  const quantity = Math.max(1, Math.min(10, Math.floor(Number(input.quantity) || 1)));
  const lines = await readCart();

  if (productId && size) {
    const existing = lines.find((line) => line.productId === productId && line.size === size);
    if (existing) existing.quantity += quantity;
    else lines.push({ productId, size, quantity });

    const store = await cookies();
    store.set(CART_COOKIE, JSON.stringify(lines), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
