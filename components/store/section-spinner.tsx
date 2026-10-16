export function SectionSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[42vh] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <span className="wearism-spin h-10 w-10 rounded-full border-[3px] border-[#ececee] border-t-ink" />
      <p className="text-sm font-semibold text-muted">{label}</p>
    </div>
  );
}
