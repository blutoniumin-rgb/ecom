"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/store/add-to-cart-button";

export function ProductPurchase({
  productId,
  sizes,
  stock,
}: {
  productId: string;
  sizes: string[];
  stock: number;
}) {
  const [size, setSize] = useState(sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const out = stock < 1;

  return (
    <div className="mt-6 space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizes.map((option) => {
            const selected = option === size;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setSize(option)}
                className={`min-w-11 rounded-full border px-3 py-2 text-sm font-semibold ${
                  selected ? "border-ink bg-ink text-white" : "border-neutral-200 bg-white text-ink"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
      <label className="block text-sm font-semibold text-ink">
        Quantity
        <select
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="mt-2 block rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium"
        >
          {Array.from({ length: Math.min(5, Math.max(stock, 1)) }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <p className="text-sm text-muted">{out ? "Out of stock" : `${stock} in stock`}</p>
      <AddToCartButton
        productId={productId}
        size={size}
        quantity={quantity}
        disabled={out}
        label={out ? "Out of stock" : "Add to cart"}
      />
    </div>
  );
}
