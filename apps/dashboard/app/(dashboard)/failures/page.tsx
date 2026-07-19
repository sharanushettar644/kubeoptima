"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, Cpu, MemoryStick, HardDrive, Network, Clock, CheckCircle } from "lucide-react";
import { clsx } from "clsx";

// Memory history trend data
const memoryHistoryData = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  memory: Math.round(75 + 15 * Math.sin(i / 3) + Math.random() * 4),
}));

export default function FailuresPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/v1/failures/predictions");
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((fp: any) => ({
            id: fp.id || fp.prediction_id,
            node: fp.node || fp.node_name,
            type: fp.type || fp.failure_type.toUpperCase().replace("_", " "),
            level: (fp.level || "warning") as "critical" | "warning" | "info",
            probability: fp.probability,
            eta: fp.eta || `${Math.round((fp.eta_seconds || 720) / 60)} minutes`,
            reason: fp.reason || (fp.contributing_factors ? fp.contributing_factors.map((f: any) => `${f.factor}: ${f.value}`).join(". ") : "Threshold breach threat detected by Autoencoder model."),
            metric: fp.failure_type === "oom" ? "Memory" : "CPU",
            icon: fp.failure_type === "oom" ? <MemoryStick className="w-4 h-4" /> : <Cpu className="w-4 h-4" />,
            action: fp.recommended_action || "Investigate logs",
            triggered: false,
          }));
          setPredictions(mapped);
        }
      } catch (err) {
        // fallback
        setPredictions([
          {
            id: "fp-001",
            node: "node/ip-10-0-4-55",
            type: "OOM Threat",
            level: "critical",
            probability: 94,
            eta: "12 minutes",
            reason: "Memory pressure climbing: 87% → 92% in 20m. 3 workloads with no memory limits. Rate of increase suggests OOM in 10-15 minutes.",
            metric: "Memory",
            icon: <MemoryStick className="w-4 h-4" />,
            action: "Evict low-priority pods",
            triggered: false,
          },
          {
            id: "fp-002",
            node: "node/ip-10-0-1-142",
            type: "CPU Saturation",
            level: "warning",
            probability: 78,
            eta: "25 minutes",
            reason: "CPU steal time increasing (2.1% → 8.4%). Noisy neighbor pattern detected. P99 latency spiking on api-server pods.",
            metric: "CPU",
            icon: <Cpu className="w-4 h-4" />,
            action: "Migrate 2 pods to adjacent node",
            triggered: false,
          },
          {
            id: "fp-003",
            node: "node/ip-10-0-2-201",
            type: "Disk Full",
            level: "warning",
            probability: 71,
            eta: "2 hours",
            reason: "Log rotation not running. /var/log usage: 78%. Growth rate: 1.2GB/hr. Projected to hit 95% in ~2 hours.",
            metric: "Storage",
            icon: <HardDrive className="w-4 h-4" />,
            action: "Trigger log rotation + alertmanager",
            triggered: true,
          }
        ]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="py-4 max-w-7xl mx-auto space-y-8 text-text-main transition-colors duration-200">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-text-main">AI Failure & Outage Prediction</h1>
        <p className="text-sm text-text-sub mt-2">
          Real-time proactive prediction of OOM kills, disk saturation, and resource starvation breaches
        </p>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Left 2 cols: predictions list */}
        <div className="col-span-2 space-y-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Failure Alerts ({predictions.length})</div>
          
          {loading ? (
            <div className="text-center py-12 text-text-sub text-xs">Loading predictions...</div>
          ) : (
            predictions.map((pred) => (
              <div
                key={pred.id}
                className={clsx(
                  "rounded-xl border p-5 shadow-card space-y-4 bg-surface transition-all",
                  pred.level === "critical" ? "border-red-200" : "border-border-custom"
                )}
              >
                {/* Alert title block */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      pred.level === "critical" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {pred.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-text-main">{pred.type}</span>
                        <span className={clsx(
                          "px-2 py-0.5 rounded text-[9px] font-bold uppercase border",
                          pred.level === "critical" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                        )}>
                          {pred.level}
                        </span>
                      </div>
                      <div className="text-[10px] text-text-sub font-mono mt-0.5">{pred.node}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={clsx(
                      "text-sm font-bold",
                      pred.level === "critical" ? "text-red-500" : "text-amber-500"
                    )}>
                      {pred.probability}% Probability
                    </div>
                    <div className="text-[10px] text-text-sub flex items-center justify-end gap-1 mt-0.5 font-medium">
                      <Clock className="w-3 h-3" /> ETA {pred.eta}
                    </div>
                  </div>
                </div>

                {/* Reason description */}
                <p className="text-xs text-text-sub leading-relaxed bg-bg-app rounded-lg p-3 border border-border-custom/50">
                  {pred.reason}
                </p>

                {/* Mitigate action banner */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-text-sub">
                    Recommended Action: <strong className="text-indigo-600 font-bold">{pred.action}</strong>
                  </span>
                  
                  <button className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-600 shadow-sm transition-colors cursor-pointer">
                    Acknowledge & Mitigate
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right 1 col: stats and chart */}
        <div className="space-y-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Outage Metrics</div>

          {/* Outage risk card */}
          <div className="rounded-xl border border-border-custom bg-surface p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Active Outage Risk
            </h3>
            <div className="space-y-3.5">
              {[
                { name: "OOM Risk", value: "Critical", score: "94%", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
                { name: "CPU Steal", value: "Elevated", score: "78%", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
                { name: "Disk Fill", value: "Moderate", score: "71%", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
                { name: "Network Link", value: "Healthy", score: "55%", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-lg border border-border-custom bg-bg-app">
                  <div className="text-xs font-bold text-text-main">{item.name}</div>
                  <div className={clsx("text-xs font-bold", item.color)}>{item.score}</div>
                </div>
              ))}
            </div>
          </div>

          {/* History chart */}
          <div className="rounded-xl border border-border-custom bg-surface p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-650" /> Node Memory Trend (24h)
            </h3>
            <div className="h-44 w-full border border-border-custom/50 rounded-lg p-2 bg-bg-app">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memoryHistoryData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 8 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip />
                  <Area type="monotone" dataKey="memory" name="Memory" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorMemory)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
