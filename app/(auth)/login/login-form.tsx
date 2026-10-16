"use client";

import { loginAction, type AuthState } from "../actions";
import Link from "next/link";
import { useActionState } from "react";

const fieldClass =
  "mt-2 w-full rounded-2xl border-2 border-ink bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-muted";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, null);

  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm font-bold text-ink" htmlFor="email">
        Email
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClass}
          placeholder="you@wearism.dev"
        />
      </label>
      <label className="mt-4 block text-sm font-bold text-ink" htmlFor="password">
        Password
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
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
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="mt-5 text-sm text-muted">
        <Link href="/forgot-password" className="font-bold text-ink underline">
          Forgot password
        </Link>
      </p>
      <p className="mt-2 text-sm text-muted">
        New here?{" "}
        <Link
          href={next === "/" ? "/register" : `/register?next=${encodeURIComponent(next)}`}
          className="font-bold text-ink underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
