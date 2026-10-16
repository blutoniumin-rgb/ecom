import { ForgotForm } from "./forgot-form";

export default function ForgotPasswordPage() {
  return (
    <>
      <p className="text-xs font-bold tracking-[0.16em] text-muted uppercase">Account</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink">Forgot password</h1>
      <p className="mt-3 text-sm text-muted">
        Enter the email on the account. If it exists, the reset link appears on the next screen.
      </p>
      <ForgotForm />
    </>
  );
}
