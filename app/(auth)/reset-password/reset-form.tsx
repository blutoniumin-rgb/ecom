"use client";

import { resetPasswordAction, type AuthState } from "../actions";
import Link from "next/link";
import { useActionState } from "react";

const fieldClass =
  "mt-2 w-full rounded-2xl border-2 border-ink bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-muted";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(resetPasswordAction, null);

  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="token" value={token} />
      <label className="block text-sm font-bold text-ink" htmlFor="password">
        New password
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={fieldClass}
        />
      </label>
      {state?.error ? <p className="mt-4 text-sm font-semibold text-ink">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Update password"}
      </button>
      <p className="mt-5 text-sm text-muted">
        <Link href="/login" className="font-bold text-ink underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
