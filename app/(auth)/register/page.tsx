import { safeNextPath } from "@/lib/auth";
import { RegisterForm } from "./register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);

  return (
    <>
      <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Account</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink">Create account</h1>
      <p className="mt-3 text-sm text-muted">New accounts are customer accounts.</p>
      <RegisterForm next={next} />
    </>
  );
}
