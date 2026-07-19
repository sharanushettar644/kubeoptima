import { clsx } from "clsx";

interface RecommendationCardProps {
  type: "rightsizing" | "spot" | "scale" | "migrate" | "binpack" | "failure";
  title: string;
  workload: string;
  namespace: string;
  impact: "critical" | "high" | "medium" | "low";
  saving?: string;
  confidence: number;
  risk: "low" | "medium" | "high";
  reason: string;
  action?: string;
  rollback?: string;
}

const typeConfig = {
  rightsizing: { label: "Rightsizing", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  spot: { label: "Spot Migration", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  scale: { label: "Predictive Scale", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  migrate: { label: "Pod Migration", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  binpack: { label: "Bin Packing", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  failure: { label: "Failure Risk", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
};

const impactConfig = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  high: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

const riskConfig = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-red-400",
};

export default function RecommendationCard({
  type,
  title,
  workload,
  namespace,
  impact,
  saving,
  confidence,
  risk,
  reason,
  action,
  rollback,
}: RecommendationCardProps) {
  const tc = typeConfig[type];
  
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 transition-all duration-200 p-5 flex flex-col justify-between gap-4 h-full min-h-[320px] group">
      {/* Top container */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className={clsx("shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold border", tc.bg, tc.border, tc.color)}>
            {tc.label}
          </div>
          {saving && (
            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-emerald-400">{saving}</div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider">saved/mo</div>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-white leading-snug">{title}</h3>
            <span className={clsx("text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wider", impactConfig[impact])}>
              {impact}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            {namespace}/{workload}
          </div>
        </div>

        {/* Reason */}
        <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 rounded-lg p-3 border border-slate-900">
          <span className="text-indigo-400 font-semibold">Why: </span>{reason}
        </div>
      </div>

      {/* Bottom container */}
      <div className="space-y-3">
        {/* Stats row */}
        <div className="flex items-center justify-between text-[11px] border-t border-slate-900 pt-3">
          {/* Confidence */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Confidence</span>
            <div className="flex items-center gap-1.5">
              <div className="w-12 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className={clsx("h-full rounded-full",
                    confidence >= 85 ? "bg-emerald-500" :
                    confidence >= 70 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <span className={clsx("font-bold",
                confidence >= 85 ? "text-emerald-400" :
                confidence >= 70 ? "text-amber-400" : "text-red-400"
              )}>
                {confidence}%
              </span>
            </div>
          </div>

          {/* Risk */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Risk:</span>
            <span className={clsx("font-bold capitalize", riskConfig[risk])}>{risk}</span>
          </div>
        </div>

        {/* Rollback */}
        {rollback && (
          <div className="text-[10px] text-slate-500 leading-normal border-t border-slate-900/50 pt-2">
            <span className="text-slate-400 font-medium">Rollback:</span> {rollback}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer">
            Apply
          </button>
          <button className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors cursor-pointer">
            Details
          </button>
          <button className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-400 transition-colors cursor-pointer">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
