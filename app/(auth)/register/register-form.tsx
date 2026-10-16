"use client";

import { registerAction, type AuthState } from "../actions";
import Link from "next/link";
import { useActionState } from "react";

const fieldClass =
  "mt-2 w-full rounded-2xl border-2 border-ink bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-muted";

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(registerAction, null);

  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm font-bold text-ink" htmlFor="name">
        Name
        <input id="name" name="name" autoComplete="name" required className={fieldClass} />
      </label>
      <label className="mt-4 block text-sm font-bold text-ink" htmlFor="email">
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
      <label className="mt-4 block text-sm font-bold text-ink" htmlFor="phone">
        Phone
        <span className="ml-2 font-medium text-muted">optional</span>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className={fieldClass} />
      </label>
      <label className="mt-4 block text-sm font-bold text-ink" htmlFor="password">
        Password
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
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-bold text-ink disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="mt-5 text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
          className="font-bold text-ink underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
