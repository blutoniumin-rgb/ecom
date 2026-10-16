const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

export type GstRange = {
  from: string;
  to: string;
  start: Date;
  end: Date;
};

export function currentMonthRange(now = new Date()): { from: string; to: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return { from, to };
}

function validDay(value: string): string | null {
  const match = DAY.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return value;
}

function bounds(from: string, to: string): GstRange | null {
  const start = new Date(`${from}T00:00:00.000+05:30`);
  const end = new Date(`${to}T23:59:59.999+05:30`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return null;
  return { from, to, start, end };
}

export function parseGstRange(raw: Record<string, string | string[] | undefined>): {
  range: GstRange;
  error: string;
} {
  const fallback = currentMonthRange();
  const fromRaw = Array.isArray(raw.from) ? raw.from[0] : raw.from;
  const toRaw = Array.isArray(raw.to) ? raw.to[0] : raw.to;
  const from = validDay((fromRaw ?? "").trim()) ?? fallback.from;
  const to = validDay((toRaw ?? "").trim()) ?? fallback.to;
  const range = bounds(from, to);
  if (!range) {
    return {
      range: {
        from,
        to,
        start: new Date(`${from}T00:00:00.000+05:30`),
        end: new Date(`${to}T23:59:59.999+05:30`),
      },
      error: "Choose a from date on or before the to date.",
    };
  }
  return { range, error: "" };
}
