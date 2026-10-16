import { safeNextPath } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);

  return (
    <>
      <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Account</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink">Sign in</h1>
      <p className="mt-3 text-sm text-muted">Use the email and password on your Wearism account.</p>
      {params.reset === "1" ? (
        <p className="mt-4 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-ink">
          Password updated. Sign in with the new password.
        </p>
      ) : null}
      <LoginForm next={next} />
    </>
  );
}
