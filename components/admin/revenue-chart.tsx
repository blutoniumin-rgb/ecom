import { formatInr } from "@/lib/format";

export type RevenueDayPoint = {
  label: string;
  total: number;
};

export function RevenueChart({ points }: { points: RevenueDayPoint[] }) {
  if (points.length === 0) {
    return <p className="text-sm text-admin-muted">No orders yet.</p>;
  }

  const max = Math.max(...points.map((point) => point.total), 1);
  const slot = 96;
  const barWidth = 28;
  const plotHeight = 132;
  const width = Math.max(points.length * slot, 280);
  const height = plotHeight + 36;
  const offset = points.length === 1 ? (width - slot) / 2 : 0;

  return (
    <div className="overflow-x-auto">
      <svg
        role="img"
        aria-label="Revenue by day"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="max-w-full"
      >
        <line
          x1="0"
          y1={plotHeight}
          x2={width}
          y2={plotHeight}
          stroke="var(--admin-muted)"
          strokeOpacity="0.35"
        />
        {points.map((point, index) => {
          const barHeight = Math.max(6, (point.total / max) * (plotHeight - 28));
          const x = offset + index * slot + (slot - barWidth) / 2;
          const y = plotHeight - barHeight;
          return (
            <g key={`${point.label}-${index}`}>
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fill="var(--admin-ink)"
                fontSize="11"
                fontFamily="inherit"
              >
                {formatInr(point.total)}
              </text>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="8"
                fill="var(--admin-accent)"
              />
              <text
                x={x + barWidth / 2}
                y={plotHeight + 20}
                textAnchor="middle"
                fill="var(--admin-muted)"
                fontSize="12"
                fontFamily="inherit"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
