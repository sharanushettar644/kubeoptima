import { clsx } from "clsx";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon?: React.ReactNode;
  accent?: "indigo" | "green" | "cyan" | "purple" | "yellow" | "red";
  score?: boolean;
  className?: string;
}

const accentMap = {
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: "text-indigo-400", glow: "shadow-[0_0_30px_rgba(99,102,241,0.15)]" },
  green: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400", glow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: "text-cyan-400", glow: "shadow-[0_0_30px_rgba(6,182,212,0.15)]" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "text-purple-400", glow: "shadow-[0_0_30px_rgba(139,92,246,0.15)]" },
  yellow: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "text-amber-400", glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]" },
  red: { bg: "bg-red-500/10", border: "border-red-500/20", icon: "text-red-400", glow: "shadow-[0_0_30px_rgba(239,68,68,0.15)]" },
};

export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  icon,
  accent = "indigo",
  score = false,
  className,
}: MetricCardProps) {
  const colors = accentMap[accent];
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={clsx(
        "relative rounded-2xl p-5 border transition-all duration-200 hover:scale-[1.01] cursor-default group",
        "bg-slate-900/50 hover:bg-slate-900/80",
        colors.border,
        colors.glow,
        className
      )}
    >
      {/* Background gradient */}
      <div className={clsx("absolute inset-0 rounded-2xl opacity-30", colors.bg)} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</div>
          {icon && (
            <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center", colors.bg, colors.icon)}>
              {icon}
            </div>
          )}
        </div>

        {score ? (
          <div className="mb-2">
            <div className="flex items-end gap-2">
              <span className={clsx("text-4xl font-bold", colors.icon)}>{value}</span>
              <span className="text-slate-500 text-sm mb-1">/100</span>
            </div>
            {/* Score bar */}
            <div className="mt-2 h-1.5 bg-slate-900/80 rounded-full overflow-hidden">
              <div
                className={clsx("h-full rounded-full transition-all duration-500",
                  accent === "green" ? "bg-emerald-400" :
                  accent === "cyan" ? "bg-cyan-400" :
                  "bg-indigo-400"
                )}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-3xl font-bold text-white mb-1">{value}</div>
        )}

        <div className="flex items-center gap-2 mt-1">
          {change !== undefined && (
            <span className={clsx(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              isPositive ? "text-emerald-400 bg-emerald-500/10" :
              isNegative ? "text-red-400 bg-red-500/10" :
              "text-slate-400 bg-slate-900/50"
            )}>
              {isPositive ? "+" : ""}{change}%
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-slate-500">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
}
