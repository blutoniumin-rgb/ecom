import { getSession } from "@/lib/auth";

export async function AuthSignOut() {
  const session = await getSession();
  if (!session) return null;

  return (
    <form action="/api/auth/logout" method="post" className="flex items-center gap-3">
      <span className="hidden text-sm font-medium text-muted sm:inline">{session.name}</span>
      <button
        type="submit"
        className="rounded-full border-2 border-ink bg-white px-4 py-1.5 text-sm font-bold text-ink"
      >
        Sign out
      </button>
    </form>
  );
}
