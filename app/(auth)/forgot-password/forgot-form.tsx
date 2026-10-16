"use client";

import { forgotPasswordAction, type AuthState } from "../actions";
import Link from "next/link";
import { useActionState } from "react";

const fieldClass =
  "mt-2 w-full rounded-2xl border-2 border-ink bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-muted";

export function ForgotForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    forgotPasswordAction,
    null,
  );

  if (state?.resetUrl) {
    return (
      <div className="mt-8 rounded-3xl border-2 border-ink bg-accent/40 p-5">
        <p className="text-sm font-bold text-ink">Reset link for this demo</p>
        <p className="mt-2 text-sm text-muted">No email is sent. Open this link within an hour.</p>
        <a href={state.resetUrl} className="mt-4 block text-sm font-bold break-all text-ink underline">
          {state.resetUrl}
        </a>
        <Link href="/login" className="mt-5 inline-block text-sm font-bold text-ink underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8">
      <label className="block text-sm font-bold text-ink" htmlFor="email">
        Email
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClass}
        />
      </label>
      {state?.error ? <p className="mt-4 text-sm font-semibold text-ink">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {pending ? "Creating link…" : "Create reset link"}
      </button>
      <p className="mt-5 text-sm text-muted">
        <Link href="/login" className="font-bold text-ink underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
