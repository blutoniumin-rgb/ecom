"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Slide = {
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  image: string;
  alt: string;
  note?: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Wearism India",
    title: "Everyday fashion, priced in rupees.",
    text: "Coats, tops, and knitwear from the latest edit. Shop by category, or browse the full catalog.",
    cta: "Shop all",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1800&q=80",
    alt: "Model wearing an everyday outfit",
  },
  {
    eyebrow: "Coats edit",
    title: "Layer up for cooler city days.",
    text: "Jackets and coats in easy, wearable cuts that go with everything you already own.",
    cta: "Shop coats",
    href: "/shop?category=coats",
    image:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1800&q=80",
    alt: "Model wearing a coat",
  },
  {
    eyebrow: "Limited offer",
    title: "₹500 off ₹2500 plus.",
    text: "Get free next-day delivery on your order when you shop the latest knitwear and tops.",
    cta: "Shop the offer",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1800&q=80",
    alt: "Model wearing a knit top",
    note: "Use code WEAR500",
  },
];

const INTERVAL_MS = 5500;

const REVEAL =
  "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

// Content slides up and fades in (staggered) on the active slide; resets instantly when hidden.
function reveal(active: boolean, delay: number): React.CSSProperties {
  return {
    opacity: active ? 1 : 0,
    transform: active ? "translateY(0)" : "translateY(24px)",
    transitionDelay: active ? `${delay}ms` : "0ms",
  };
}

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => setIndex((current) => (current + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [index, paused]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative mt-5 mb-3 overflow-hidden rounded-3xl bg-accent-soft text-ink shadow-[0_1px_2px_rgba(17,17,17,0.06),0_8px_16px_-4px_rgba(17,17,17,0.10),0_28px_56px_-12px_rgba(17,17,17,0.22),0_40px_80px_-24px_rgba(255,122,61,0.30)] ring-1 ring-black/5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative h-[380px] sm:h-[460px] lg:h-[500px]">
        {SLIDES.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.title}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${SLIDES.length}`}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
                active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className={`absolute inset-0 h-full w-full object-cover object-top will-change-transform motion-reduce:transition-none ${
                  active
                    ? "scale-100 duration-[7000ms] ease-out"
                    : "scale-110 delay-1000 duration-0"
                } transition-transform`}
                loading={i === 0 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-accent-soft via-accent-soft/80 to-transparent sm:via-accent-soft/55" />

              <div className="relative flex h-full flex-col justify-center px-6 pb-14 sm:px-12 sm:pb-10 lg:px-16">
                <p
                  style={reveal(active, 150)}
                  className={`text-xs font-bold tracking-[0.22em] text-accent uppercase ${REVEAL}`}
                >{slide.eyebrow}</p>
                <h2
                  style={reveal(active, 300)}
                  className={`mt-3 max-w-xl text-3xl font-extrabold tracking-tight sm:text-5xl ${REVEAL}`}
                >
                  {slide.title}
                </h2>
                <p
                  style={reveal(active, 450)}
                  className={`mt-3 max-w-md text-sm leading-relaxed text-ink/70 ${REVEAL}`}
                >
                  {slide.text}
                </p>
                <div style={reveal(active, 600)} className={`mt-6 flex flex-wrap items-center gap-3 ${REVEAL}`}>
                  <Link
                    href={slide.href}
                    tabIndex={active ? 0 : -1}
                    className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_-6px_rgba(17,17,17,0.45)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-accent hover:shadow-[0_14px_26px_-6px_rgba(255,122,61,0.6)] active:translate-y-0"
                  >
                    {slide.cta}
                  </Link>
                  {slide.note ? (
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-bold tracking-wide text-accent uppercase shadow-[0_6px_14px_-4px_rgba(17,17,17,0.18)]">
                      {slide.note}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-between px-6 sm:px-12 lg:px-16">
        <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-all duration-500 ease-out ${
                i === index ? "w-8 bg-accent shadow-[0_2px_8px_rgba(255,122,61,0.5)]" : "w-2 bg-ink/25 hover:bg-ink/50"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-ink shadow-[0_6px_14px_-4px_rgba(17,17,17,0.25)] backdrop-blur transition duration-300 ease-out hover:scale-110 hover:bg-accent hover:text-white active:scale-95"
          >
            <Arrow direction="left" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-ink shadow-[0_6px_14px_-4px_rgba(17,17,17,0.25)] backdrop-blur transition duration-300 ease-out hover:scale-110 hover:bg-accent hover:text-white active:scale-95"
          >
            <Arrow direction="right" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path
        d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
