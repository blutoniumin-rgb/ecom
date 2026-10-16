import { updateProfile } from "@/app/(account)/actions";

const fieldClass =
  "mt-1.5 h-11 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-ink outline-none focus:border-ink";

export function ProfileForm({
  name,
  email,
  phone,
  saved,
  error,
}: {
  name: string;
  email: string;
  phone: string;
  saved: boolean;
  error?: string;
}) {
  return (
    <form action={updateProfile} className="mt-6 max-w-lg space-y-4">
      <label className="block text-sm font-bold text-ink" htmlFor="name">
        Name
        <input id="name" name="name" required defaultValue={name} maxLength={80} className={fieldClass} />
      </label>
      <label className="block text-sm font-bold text-ink" htmlFor="email">
        Email
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={email}
          readOnly
          className={`${fieldClass} bg-[#f6f6f7] text-muted`}
        />
      </label>
      <label className="block text-sm font-bold text-ink" htmlFor="phone">
        Phone
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone}
          maxLength={20}
          autoComplete="tel"
          className={fieldClass}
          placeholder="Optional"
        />
      </label>
      {error ? <p className="text-sm font-semibold text-ink">{error}</p> : null}
      {saved ? <p className="text-sm font-semibold text-ink">Profile saved.</p> : null}
      <button type="submit" className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white">
        Save profile
      </button>
    </form>
  );
}
