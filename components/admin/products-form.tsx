"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { saveProduct } from "@/components/admin/products-actions";
import type { ProductFormState } from "@/components/admin/products-query";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

const fieldClass =
  "mt-2 w-full rounded-2xl bg-admin-bg px-4 py-3 text-sm text-admin-ink outline-none ring-1 ring-black/[0.04] placeholder:text-admin-muted focus:ring-2 focus:ring-admin-accent/30";

export type ProductDraft = {
  name: string;
  sku: string;
  description: string;
  price: string;
  mrp: string;
  stock: string;
  categoryId: string;
  sizes: string;
  colors: string;
  imageUrls: string;
  active: boolean;
};

export function ProductEditor({
  title,
  productId,
  initial,
  categories,
}: {
  title: string;
  productId: string;
  initial: ProductDraft;
  categories: { id: string; name: string }[];
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/products" className="text-sm font-medium text-admin-muted hover:text-admin-ink">
        ← Products
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-admin-muted">
        The slug is generated from the name. Paste image URLs or upload pictures.
      </p>
      <div className="mt-5 rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(28,28,28,0.04)]">
        {categories.length === 0 ? (
          <p className="text-sm text-admin-muted">No categories are available, so a product cannot be saved.</p>
        ) : (
          <ProductForm productId={productId} initial={initial} categories={categories} />
        )}
      </div>
    </div>
  );
}

function ProductForm({
  productId,
  initial,
  categories,
}: {
  productId: string;
  initial: ProductDraft;
  categories: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProduct, null);
  const [draft, setDraft] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadQueue = useRef(Promise.resolve());

  function update(patch: Partial<ProductDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function uploadImages(list: FileList | null) {
    const files = list ? Array.from(list) : [];
    if (files.length === 0) return;
    const run = uploadQueue.current.then(() => sendUploads(files));
    uploadQueue.current = run.then(
      () => undefined,
      () => undefined,
    );
  }

  async function sendUploads(files: File[]) {
    setUploading(true);
    setUploadError(null);
    const errors: string[] = [];
    const added: string[] = [];
    try {
      for (const file of files) {
        if (file.size > MAX_UPLOAD_BYTES) {
          errors.push(`${file.name} is larger than 5 MB.`);
          continue;
        }
        const body = new FormData();
        body.set("file", file);
        const response = await fetch("/api/admin/product-image", { method: "POST", body });
        const payload = (await response.json().catch(() => null)) as { path?: string; error?: string } | null;
        if (!response.ok || !payload?.path) {
          errors.push(payload?.error ?? `Could not upload ${file.name}.`);
          continue;
        }
        added.push(payload.path);
      }
      if (added.length > 0) {
        setDraft((current) => {
          const trimmed = current.imageUrls.trim();
          return { ...current, imageUrls: [trimmed, ...added].filter(Boolean).join("\n") };
        });
      }
    } catch {
      errors.push("Could not upload the image. Try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (errors.length > 0) setUploadError(errors.join(" "));
    }
  }

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="productId" value={productId} />
      <Field label="Name" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          maxLength={120}
          value={draft.name}
          onChange={(event) => update({ name: event.target.value })}
          className={fieldClass}
        />
      </Field>
      <Field label="SKU" htmlFor="sku">
        <input
          id="sku"
          name="sku"
          required
          maxLength={64}
          spellCheck={false}
          value={draft.sku}
          onChange={(event) => update({ sku: event.target.value })}
          className={fieldClass}
        />
      </Field>
      <Field label="Price (₹)" htmlFor="price">
        <input
          id="price"
          name="price"
          required
          inputMode="numeric"
          value={draft.price}
          onChange={(event) => update({ price: event.target.value })}
          className={fieldClass}
        />
      </Field>
      <Field label="MRP (₹)" htmlFor="mrp">
        <input
          id="mrp"
          name="mrp"
          required
          inputMode="numeric"
          value={draft.mrp}
          onChange={(event) => update({ mrp: event.target.value })}
          className={fieldClass}
        />
      </Field>
      <Field label="Stock" htmlFor="stock">
        <input
          id="stock"
          name="stock"
          required
          inputMode="numeric"
          value={draft.stock}
          onChange={(event) => update({ stock: event.target.value })}
          className={fieldClass}
        />
      </Field>
      <Field label="Category" htmlFor="categoryId">
        <select
          id="categoryId"
          name="categoryId"
          required
          value={draft.categoryId}
          onChange={(event) => update({ categoryId: event.target.value })}
          className={fieldClass}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Sizes" htmlFor="sizes" hint="Comma-separated, for example XS, S, M, L.">
        <input
          id="sizes"
          name="sizes"
          value={draft.sizes}
          onChange={(event) => update({ sizes: event.target.value })}
          className={fieldClass}
        />
      </Field>
      <Field label="Colors" htmlFor="colors" hint="Comma-separated.">
        <input
          id="colors"
          name="colors"
          value={draft.colors}
          onChange={(event) => update({ colors: event.target.value })}
          className={fieldClass}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Description" htmlFor="description">
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            maxLength={5000}
            value={draft.description}
            onChange={(event) => update({ description: event.target.value })}
            className={fieldClass}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="imageUrls" className="text-sm font-medium">
            Image URLs
          </label>
          <button
            type="button"
            disabled={uploading || pending}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-admin-accent px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            <UploadIcon />
            {uploading ? "Uploading…" : "Upload image"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            className="sr-only"
            onChange={(event) => void uploadImages(event.target.files)}
          />
        </div>
        <textarea
          id="imageUrls"
          name="imageUrls"
          rows={4}
          spellCheck={false}
          value={draft.imageUrls}
          onChange={(event) => update({ imageUrls: event.target.value })}
          placeholder="https://"
          className={fieldClass}
        />
        <span className="mt-1 block text-xs font-normal text-admin-muted">
          One http or https URL per line, or comma-separated. Uploaded images are added below.
        </span>
        {uploadError ? (
          <p role="alert" className="mt-2 rounded-2xl bg-admin-peach px-4 py-3 text-sm">
            {uploadError}
          </p>
        ) : null}
        <ImagePreviews value={draft.imageUrls} />
      </div>
      <label className="flex items-center gap-3 text-sm font-medium sm:col-span-2">
        <input
          type="checkbox"
          name="active"
          checked={draft.active}
          onChange={(event) => update({ active: event.target.checked })}
          className="size-4 accent-admin-accent"
        />
        Active
      </label>
      {state?.error ? (
        <p role="alert" className="rounded-2xl bg-admin-peach px-4 py-3 text-sm sm:col-span-2">
          {state.error}
        </p>
      ) : null}
      <div className="flex items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center rounded-full bg-admin-accent px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : productId ? "Save changes" : "Create product"}
        </button>
        <Link href="/admin/products" className="text-sm font-medium text-admin-muted">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function previewSources(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(
      (item) =>
        item.startsWith("https://") ||
        item.startsWith("http://") ||
        item.startsWith("/uploads/products/") ||
        /^\/api\/media\/[0-9a-f-]{36}$/i.test(item),
    );
}

function ImagePreviews({ value }: { value: string }) {
  const sources = previewSources(value);
  if (sources.length === 0) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {sources.map((source, index) => (
        <li key={`${source}-${index}`} className="size-16 overflow-hidden rounded-xl bg-admin-bg ring-1 ring-black/[0.04]">
          <img src={source} alt="" className="size-full object-cover" />
        </li>
      ))}
    </ul>
  );
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 20h16" />
    </svg>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium">
      {label}
      {children}
      {hint ? <span className="mt-1 block text-xs font-normal text-admin-muted">{hint}</span> : null}
    </label>
  );
}
