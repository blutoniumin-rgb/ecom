import Link from "next/link";
import { ResetForm } from "./reset-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <>
      <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Account</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink">Set a new password</h1>
      {token ? (
        <>
          <p className="mt-3 text-sm text-muted">Choose a new password for this account.</p>
          <ResetForm token={token} />
        </>
      ) : (
        <div className="mt-8">
          <p className="text-sm font-semibold text-ink">This reset link is missing a token.</p>
          <Link href="/forgot-password" className="mt-4 inline-block text-sm font-bold text-ink underline">
            Request a new link
          </Link>
        </div>
      )}
    </>
  );
}
