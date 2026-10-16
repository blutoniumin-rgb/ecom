"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { persistGuestCart } from "@/lib/cart";

export function CartSync({ needsSync }: { needsSync: boolean }) {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (!needsSync || started.current) return;
    started.current = true;
    void persistGuestCart().then(() => {
      router.refresh();
    });
  }, [needsSync, router]);

  return null;
}
