"use client";

import { useState } from "react";

export function PromoBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <section className="relative mt-5 overflow-hidden rounded-[28px] bg-[#ffb7e6] px-4 py-5 sm:px-8 sm:py-6">
      <Sticker className="left-[6%] top-4 hidden -rotate-12 lg:block" label="Sale" />
      <CrocHeel className="left-[4%] bottom-2 hidden lg:block" />
      <MiniShoe className="left-[22%] top-3 hidden rotate-6 lg:block" />
      <MiniShoe className="right-[26%] bottom-2 hidden -rotate-6 lg:block" />
      <CapShoe className="right-[4%] top-3 hidden lg:block" />
      <OffShoe className="right-[16%] top-2 hidden rotate-12 xl:block" />

      <div className="relative z-10 mx-auto max-w-md px-1 text-center">
        <h2 className="text-lg font-extrabold tracking-tight text-ink uppercase sm:text-xl lg:text-2xl">
          ₹500 off ₹2500 plus,
          <br />
          get free next-day delivery
        </h2>
        <p className="mt-2 text-xs text-ink/80">With code: WEAR500</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-3 rounded-full bg-ink px-6 py-2 text-xs font-bold tracking-wide text-white"
        >
          OK
        </button>
      </div>
    </section>
  );
}

function Sticker({ className, label }: { className: string; label: string }) {
  return (
    <svg className={`pointer-events-none absolute h-16 w-24 ${className}`} viewBox="0 0 120 70" aria-hidden="true">
      <path d="M8 40c18-28 70-36 96-8" fill="none" stroke="#111" strokeWidth="3" />
      <text x="28" y="46" fill="#111" fontSize="22" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700">
        {label}
      </text>
    </svg>
  );
}

function CrocHeel({ className }: { className: string }) {
  return (
    <svg className={`pointer-events-none absolute h-28 w-32 ${className}`} viewBox="0 0 160 140" aria-hidden="true">
      <path d="M18 78c22-8 48-6 62 10 8 22-6 36-28 34-16-2-30-14-34-28-2-8 0-14 0-16Z" fill="#7a5cff" stroke="#111" strokeWidth="3" />
      <path d="M70 86c22 2 40 16 46 28" fill="none" stroke="#111" strokeWidth="3" />
      <path d="M108 108c18 8 28 6 34-4 4-8-2-16-12-16-8 4-16 10-22 20Z" fill="#7a5cff" stroke="#111" strokeWidth="3" />
      <path d="M118 96c10-16 8-28-4-36-14-8-28 2-30 16" fill="#c9b6ff" stroke="#111" strokeWidth="3" />
      <circle cx="96" cy="78" r="3" fill="#111" />
      <path d="M86 86c6 4 12 4 18 0" fill="none" stroke="#111" strokeWidth="2" />
      <path d="M124 118c2 10-2 16-10 18" fill="none" stroke="#e11d48" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 70c-8-10-6-22 6-26 4 8 4 16 0 24" fill="#7a5cff" stroke="#111" strokeWidth="3" />
      <text x="18" y="28" fill="#111" fontSize="16" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700">
        Sale
      </text>
    </svg>
  );
}

function CapShoe({ className }: { className: string }) {
  return (
    <svg className={`pointer-events-none absolute h-28 w-36 ${className}`} viewBox="0 0 170 130" aria-hidden="true">
      <path d="M28 78c20-36 78-40 108-8 8 8 6 18-8 22-28 8-70 8-100-14Z" fill="#9b6dff" stroke="#111" strokeWidth="3" />
      <path d="M46 70c6-22 28-34 48-28 8 18-6 32-24 36-12 2-20-2-24-8Z" fill="#111" />
      <path d="M78 48c16-2 28 6 32 16" fill="none" stroke="#111" strokeWidth="3" />
      <circle cx="118" cy="62" r="10" fill="#111" />
      <circle cx="142" cy="62" r="10" fill="#111" />
      <circle cx="118" cy="62" r="4" fill="#fff" />
      <circle cx="142" cy="62" r="4" fill="#fff" />
      <path d="M124 84c8 6 16 6 24 0" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />
      <path d="M36 92c40 16 78 10 104-8" fill="none" stroke="#111" strokeWidth="3" />
    </svg>
  );
}

function MiniShoe({ className }: { className: string }) {
  return (
    <svg className={`pointer-events-none absolute h-12 w-14 ${className}`} viewBox="0 0 80 60" aria-hidden="true">
      <path d="M8 36c12-16 36-18 52-4 4 8-2 14-14 14H22c-10 0-16-4-14-10Z" fill="#b9a3f5" stroke="#111" strokeWidth="2.5" />
      <circle cx="48" cy="28" r="5" fill="#111" />
    </svg>
  );
}

function OffShoe({ className }: { className: string }) {
  return (
    <svg className={`pointer-events-none absolute h-14 w-16 ${className}`} viewBox="0 0 90 70" aria-hidden="true">
      <path d="M10 40c14-18 40-20 58-2 6 10-4 16-16 16H24C12 54 6 48 10 40Z" fill="#7a5cff" stroke="#111" strokeWidth="2.5" />
      <text x="28" y="28" fontSize="14" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700" fill="#111">
        off
      </text>
    </svg>
  );
}
