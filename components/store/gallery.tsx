"use client";

import { useState } from "react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return <div className="aspect-[3/4] rounded-[28px] bg-[#f2f2f2]" />;
  }

  return (
    <div className="min-w-0">
      <div className="overflow-hidden rounded-[28px] bg-[#f2f2f2]">
        <img src={current} alt={alt} className="aspect-[3/4] w-full object-cover" />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              className={`shrink-0 overflow-hidden rounded-2xl border-2 ${index === active ? "border-ink" : "border-transparent"}`}
            >
              <img src={image} alt="" className="h-20 w-16 object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
