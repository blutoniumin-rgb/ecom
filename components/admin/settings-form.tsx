"use client";

import { useActionState, useState } from "react";
import { saveSettings, type SettingsFormState } from "@/components/admin/settings-actions";

const fieldClass =
  "mt-2 w-full rounded-2xl bg-admin-bg px-4 py-3 text-sm text-admin-ink outline-none ring-1 ring-black/[0.04] placeholder:text-admin-muted focus:ring-2 focus:ring-admin-accent/30";

export function SettingsForm({
  initial,
}: {
  initial: {
    storeName: string;
    supportEmail: string;
    gstThreshold: number;
    gstLowRate: number;
    gstHighRate: number;
  };
}) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(saveSettings, null);
  const [draft, setDraft] = useState({
    storeName: initial.storeName,
    supportEmail: initial.supportEmail,
    gstThreshold: String(initial.gstThreshold),
    gstLowRate: String(initial.gstLowRate),
    gstHighRate: String(initial.gstHighRate),
  });

  return (
    <form action={action} className="grid max-w-xl gap-4">
      <label htmlFor="storeName" className="block text-sm font-medium">
        Store name
        <input
          id="storeName"
          name="storeName"
          required
          maxLength={80}
          value={draft.storeName}
          onChange={(event) => setDraft((current) => ({ ...current, storeName: event.target.value }))}
          className={fieldClass}
        />
      </label>
      <label htmlFor="supportEmail" className="block text-sm font-medium">
        Support email
        <input
          id="supportEmail"
          name="supportEmail"
          type="email"
          required
          maxLength={120}
          value={draft.supportEmail}
          onChange={(event) => setDraft((current) => ({ ...current, supportEmail: event.target.value }))}
          className={fieldClass}
        />
      </label>
      <label htmlFor="gstThreshold" className="block text-sm font-medium">
        GST threshold (₹)
        <input
          id="gstThreshold"
          name="gstThreshold"
          required
          inputMode="numeric"
          min={0}
          value={draft.gstThreshold}
          onChange={(event) => setDraft((current) => ({ ...current, gstThreshold: event.target.value }))}
          className={fieldClass}
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label htmlFor="gstLowRate" className="block text-sm font-medium">
          Low rate (%)
          <input
            id="gstLowRate"
            name="gstLowRate"
            required
            inputMode="numeric"
            min={0}
            max={100}
            value={draft.gstLowRate}
            onChange={(event) => setDraft((current) => ({ ...current, gstLowRate: event.target.value }))}
            className={fieldClass}
          />
        </label>
        <label htmlFor="gstHighRate" className="block text-sm font-medium">
          High rate (%)
          <input
            id="gstHighRate"
            name="gstHighRate"
            required
            inputMode="numeric"
            min={0}
            max={100}
            value={draft.gstHighRate}
            onChange={(event) => setDraft((current) => ({ ...current, gstHighRate: event.target.value }))}
            className={fieldClass}
          />
        </label>
      </div>
      <p className="text-xs text-admin-muted">
        At or under the threshold, the low rate applies. Above it, the high rate applies. Defaults are ₹1,000, 5%, and 12%.
      </p>
      {state && "error" in state ? (
        <p role="alert" className="rounded-2xl bg-admin-peach px-4 py-3 text-sm">
          {state.error}
        </p>
      ) : null}
      {state && "ok" in state ? (
        <p role="status" className="rounded-2xl bg-[#ecfdf3] px-4 py-3 text-sm text-[#166534]">
          Settings saved.
        </p>
      ) : null}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center rounded-full bg-admin-accent px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
