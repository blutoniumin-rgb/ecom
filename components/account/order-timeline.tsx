import { ORDER_STEPS, statusLabel } from "@/components/account/labels";

export function OrderTimeline({ status }: { status: string }) {
  const current = ORDER_STEPS.findIndex((step) => step.key === status);

  return (
    <section>
      <h2 className="text-sm font-bold tracking-wide text-ink">Status</h2>
      {current < 0 ? (
        <p className="mt-3 text-sm text-ink">
          Current status: <span className="font-bold">{statusLabel(status)}</span>
        </p>
      ) : null}
      <ol className="mt-4 grid gap-4 sm:grid-cols-4">
        {ORDER_STEPS.map((step, index) => {
          const reached = current >= 0 && index <= current;
          const active = current === index;
          return (
            <li key={step.key} className="flex items-center gap-3 sm:flex-col sm:items-start">
              <span
                className={
                  reached
                    ? "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white"
                    : "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f3f3f4] text-xs font-bold text-muted"
                }
                aria-hidden
              >
                {index + 1}
              </span>
              <span className={active ? "text-sm font-bold text-ink" : "text-sm text-muted"}>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
