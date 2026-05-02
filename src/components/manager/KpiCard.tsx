import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down" | "flat";
  hint?: string;
  accent?: "ink" | "coral" | "yale" | "cream";
  icon?: ReactNode;
}

const ACCENT: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  ink: "from-ink to-ink-soft text-white",
  coral: "from-coral to-coral-deep text-white",
  yale: "from-yale to-[#0A3A6E] text-white",
  cream: "from-white to-cream-2 text-ink",
};

export default function KpiCard({
  label,
  value,
  delta,
  trend,
  hint,
  accent = "cream",
  icon,
}: KpiCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-500"
      : trend === "down"
        ? "text-rose-400"
        : "text-muted";
  const arrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const onDark = accent !== "cream";

  return (
    <div
      className={`relative overflow-hidden rounded-card bg-gradient-to-br p-5 shadow-sm ring-1 ring-line ${ACCENT[accent]}`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`text-[11px] uppercase tracking-wider ${
            onDark ? "text-white/70" : "text-muted"
          }`}
        >
          {label}
        </div>
        {icon ? <div className="text-xl opacity-80">{icon}</div> : null}
      </div>
      <div className="mt-3 font-display text-3xl font-bold leading-none">
        {value}
      </div>
      {(delta || hint) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {delta && (
            <span className={`font-semibold ${onDark ? "text-white/90" : trendColor}`}>
              {arrow} {delta}
            </span>
          )}
          {hint && (
            <span className={onDark ? "text-white/70" : "text-muted"}>
              {hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
