"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  PRICE_OPTIONS,
  SHOW_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  isProductFiltered,
  optionLabel,
  productsHref,
  type ProductQuery,
} from "@/components/admin/products-query";

type CategoryOption = { slug: string; name: string };

export function ProductsToolbar({
  categories,
  query,
}: {
  categories: CategoryOption[];
  query: ProductQuery;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState(query.q);
  const [menu, setMenu] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const filtered = isProductFiltered(query) || draft.trim() !== query.q;

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setMenu(null);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenu(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function go(patch: Partial<ProductQuery>) {
    setMenu(null);
    router.push(productsHref({ ...query, q: draft.trim() }, patch), { scroll: false });
  }

  function reset() {
    setDraft("");
    setMenu(null);
    router.push(query.view === "grid" ? "/admin/products?view=grid" : "/admin/products", { scroll: false });
  }

  const categoryOptions = [
    { value: "", label: "All collections" },
    ...categories.map((category) => ({ value: category.slug, label: category.name })),
  ];

  return (
    <div ref={rootRef}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 items-center rounded-xl bg-[#f6f7f9] p-1">
          <ViewButton
            label="List view"
            pressed={query.view === "list"}
            onClick={() => go({ view: "list" })}
          >
            <ListIcon />
          </ViewButton>
          <ViewButton
            label="Grid view"
            pressed={query.view === "grid"}
            onClick={() => go({ view: "grid" })}
          >
            <GridIcon />
          </ViewButton>
        </div>

        <form
          className="relative min-w-[200px] flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            go({});
          }}
        >
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-admin-muted">
            <SearchIcon />
          </span>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search..."
            aria-label="Search products"
            className="h-11 w-full rounded-full bg-[#f6f7f9] pr-4 pl-11 text-sm text-admin-ink outline-none placeholder:text-admin-muted focus:bg-white focus:ring-2 focus:ring-admin-accent/30"
          />
        </form>

        <Menu
          id="show"
          open={menu === "show"}
          onToggle={() => setMenu((current) => (current === "show" ? null : "show"))}
          prefix="Show:"
          label={optionLabel(SHOW_OPTIONS, query.show, "All products")}
          options={SHOW_OPTIONS}
          selected={query.show}
          onSelect={(value) => go({ show: value as ProductQuery["show"] })}
        />
        <Menu
          id="sort"
          open={menu === "sort"}
          onToggle={() => setMenu((current) => (current === "sort" ? null : "sort"))}
          prefix="Sort by:"
          label={optionLabel(SORT_OPTIONS, query.sort, "Default")}
          options={SORT_OPTIONS}
          selected={query.sort}
          onSelect={(value) => go({ sort: value as ProductQuery["sort"] })}
        />

        <button
          type="button"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((open) => !open)}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-admin-accent/70 px-4 text-sm font-medium text-admin-accent"
        >
          <FunnelIcon />
          Filter
          {isProductFiltered(query) ? <span className="size-1.5 rounded-full bg-admin-accent" /> : null}
        </button>

        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-admin-accent px-4 text-sm font-semibold text-white shadow-[0_8px_16px_rgba(255,122,61,0.28)] sm:ml-auto"
        >
          <span className="grid size-5 place-items-center rounded-full bg-white/20 text-base leading-none">+</span>
          Add new product
        </Link>
      </div>

      {filtersOpen ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FilterField label="Category">
            <Menu
              id="category"
              wide
              open={menu === "category"}
              onToggle={() => setMenu((current) => (current === "category" ? null : "category"))}
              label={optionLabel(categoryOptions, query.category, "All collections")}
              options={categoryOptions}
              selected={query.category}
              onSelect={(value) => go({ category: value })}
            />
          </FilterField>
          <FilterField label="Price">
            <Menu
              id="price"
              wide
              open={menu === "price"}
              onToggle={() => setMenu((current) => (current === "price" ? null : "price"))}
              label={optionLabel(PRICE_OPTIONS, query.price, "All prices")}
              options={PRICE_OPTIONS}
              selected={query.price}
              onSelect={(value) => go({ price: value })}
            />
          </FilterField>
          <FilterField label="Status">
            <Menu
              id="status"
              wide
              open={menu === "status"}
              onToggle={() => setMenu((current) => (current === "status" ? null : "status"))}
              label={optionLabel(STATUS_OPTIONS, query.status, "All status")}
              options={STATUS_OPTIONS}
              selected={query.status}
              onSelect={(value) => go({ status: value as ProductQuery["status"] })}
            />
          </FilterField>
          <FilterField label="Collection">
            <Menu
              id="collection"
              wide
              open={menu === "collection"}
              onToggle={() => setMenu((current) => (current === "collection" ? null : "collection"))}
              label={optionLabel(categoryOptions, query.collection, "All collections")}
              options={categoryOptions}
              selected={query.collection}
              onSelect={(value) => go({ collection: value })}
            />
          </FilterField>
        </div>
      ) : null}

      {filtered ? (
        <button type="button" onClick={reset} className="mt-3 text-sm font-medium text-admin-accent">
          Reset filters
        </button>
      ) : null}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-admin-muted">{label}</p>
      {children}
    </div>
  );
}

function ViewButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`grid size-9 place-items-center rounded-lg ${
        pressed ? "bg-white text-admin-accent shadow-sm" : "text-admin-muted"
      }`}
    >
      {children}
    </button>
  );
}

function Menu({
  id,
  open,
  onToggle,
  prefix,
  label,
  options,
  selected,
  onSelect,
  wide,
}: {
  id: string;
  open: boolean;
  onToggle: () => void;
  prefix?: string;
  label: string;
  options: readonly { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
  wide?: boolean;
}) {
  const listId = useId();
  return (
    <div className={`relative ${wide ? "w-full" : ""}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        onClick={onToggle}
        className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm ${
          wide ? "w-full justify-between" : ""
        } ${open ? "bg-white ring-1 ring-admin-accent/40" : "bg-[#f4f5f7]"}`}
      >
        <span className="truncate">
          {prefix ? <span className="text-admin-muted">{prefix} </span> : null}
          <span className="font-medium text-admin-ink">{label}</span>
        </span>
        <Chevron open={open} />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={prefix ? `${prefix} ${label}` : id}
          className="absolute top-full left-0 z-30 mt-2 w-full min-w-[190px] rounded-2xl bg-white p-1.5 shadow-[0_12px_40px_rgba(28,28,28,0.12)] ring-1 ring-black/[0.05]"
        >
          {options.map((option) => {
            const isSelected = option.value === selected;
            return (
              <li key={option.value || "all"} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => onSelect(option.value)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium ${
                    isSelected ? "bg-admin-peach text-admin-accent" : "text-admin-ink hover:bg-admin-bg"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 text-admin-muted ${open ? "rotate-180" : ""}`}
    >
      <path d="M3 5.25 7 9.25 11 5.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 7h12M8 12h12M8 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="4.5" cy="7" r="1" fill="currentColor" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" />
      <circle cx="4.5" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function FunnelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16l-6 7.2V19l-4 1.5v-7.3L4 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
