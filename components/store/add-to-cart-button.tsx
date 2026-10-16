"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";

export function AddToCartButton({
  productId,
  size,
  quantity = 1,
  disabled = false,
  label = "Add to cart",
  compact = false,
}: {
  productId: string;
  size: string;
  quantity?: number;
  disabled?: boolean;
  label?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");

  return (
    <div className={compact ? "" : "flex flex-col gap-2"}>
      <button
        type="button"
        disabled={disabled || pending || !size}
        onClick={() => {
          setNote("");
          startTransition(async () => {
            await addToCart({ productId, size, quantity });
            setNote("Added to bag");
            router.refresh();
          });
        }}
        className={
          compact
            ? "block w-full max-w-full overflow-hidden rounded-full bg-ink px-3 py-2 text-center text-xs font-semibold text-ellipsis whitespace-nowrap text-white disabled:opacity-50"
            : "rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
        }
      >
        {pending ? "Adding…" : label}
      </button>
      {note && !compact ? <p className="text-sm text-muted">{note}</p> : null}
    </div>
  );
}
