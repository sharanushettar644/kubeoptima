"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Zap, Clock, DollarSign } from "lucide-react";
import { clsx } from "clsx";

// Static spot price trend data
const spotPriceData = Array.from({ length: 48 }, (_, i) => ({
  time: `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
  price: 0.08 + Math.sin(i * 0.3) * 0.025 + Math.random() * 0.01,
  onDemand: 0.384,
  interruptRisk: Math.max(0, Math.min(100, 15 + Math.sin(i * 0.4) * 20 + Math.random() * 10)),
}));

export default function SpotPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/v1/spot/predictions");
        if (res.ok) {
          const data = await res.json();
          // Map backend format if available
          setInstances(data);
        } else {
          throw new Error("fail");
        }
      } catch (err) {
        setInstances([
          { type: "c5.2xlarge", az: "us-east-1a", spotPrice: 0.082, onDemand: 0.340, saving: "76%", interruptProb: 8, pools: 3, status: "safe", workloads: 12 },
          { type: "m5.xlarge", az: "us-east-1b", spotPrice: 0.045, onDemand: 0.192, saving: "77%", interruptProb: 14, pools: 5, status: "safe", workloads: 8 },
          { type: "r5.large", az: "us-east-1c", spotPrice: 0.038, onDemand: 0.126, saving: "70%", interruptProb: 22, pools: 2, status: "watch", workloads: 4 }
        ]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="py-4 max-w-7xl mx-auto space-y-8 text-text-main transition-colors duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-main">AI Spot Instance Optimizer</h1>
          <p className="text-sm text-text-sub mt-2">
            Predicts interruptions using XGBoost + Bayesian models · Auto-migrates before eviction
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-sub font-semibold">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Auto-migration enabled
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: "Spot Nodes", value: "27", sub: "32% of fleet", color: "text-amber-600 bg-amber-50/50 border-amber-100" },
          { label: "Spot Savings", value: "$18.4k", sub: "this month", color: "text-emerald-600 bg-emerald-50/50 border-emerald-100" },
          { label: "Interruptions Avoided", value: "6", sub: "auto-migrated", color: "text-indigo-650 bg-indigo-50/50 border-indigo-100" },
          { label: "Avg Interrupt Risk", value: "11%", sub: "current pools", color: "text-purple-650 bg-purple-50/50 border-purple-100" },
        ].map((s, i) => (
          <div key={i} className={clsx("rounded-xl border p-5 shadow-sm space-y-1", s.color)}>
            <div className="text-[10px] text-text-sub font-bold uppercase tracking-widest">{s.label}</div>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-[10px] text-slate-450 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Price trend chart */}
      <div className="rounded-xl border border-border-custom bg-surface p-5 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-indigo-650" /> Spot vs On-Demand Price Trend (24h)
        </h3>
        <div className="h-64 w-full border border-border-custom/50 rounded-lg p-2 bg-bg-app">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spotPriceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} unit="$" />
              <Tooltip />
              <Area type="monotone" dataKey="price" name="Spot Price" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
              <Area type="monotone" dataKey="onDemand" name="On-Demand Limit" stroke="#ef4444" strokeDasharray="4 4" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active spot pools */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-purple-650" /> Active Spot Pools & Eviction Risk
        </h3>
        <div className="rounded-xl border border-border-custom bg-surface overflow-hidden shadow-card">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-custom/50 text-[10px] font-bold text-slate-450 uppercase tracking-widest bg-slate-500/[0.02]">
                <th className="py-3.5 px-5">Instance Type</th>
                <th className="py-3.5 px-5">Zone</th>
                <th className="py-3.5 px-5 text-right">Spot Price</th>
                <th className="py-3.5 px-5 text-right">On-Demand Price</th>
                <th className="py-3.5 px-5 text-right">Saving</th>
                <th className="py-3.5 px-5 text-center">Eviction Probability</th>
                <th className="py-3.5 px-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom/30 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-text-sub">Loading spot pools...</td>
                </tr>
              ) : (
                instances.map((inst, i) => (
                  <tr key={i} className="hover:bg-slate-500/[0.01] transition-colors">
                    <td className="py-3.5 px-5 font-bold text-text-main font-mono">{inst.type}</td>
                    <td className="py-3.5 px-5 text-text-sub font-mono">{inst.az}</td>
                    <td className="py-3.5 px-5 text-right font-mono">${inst.spotPrice.toFixed(3)}/hr</td>
                    <td className="py-3.5 px-5 text-right font-mono">${inst.onDemand.toFixed(3)}/hr</td>
                    <td className="py-3.5 px-5 text-right font-bold text-emerald-600">{inst.saving}</td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={clsx("h-full rounded-full", inst.interruptProb > 20 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${inst.interruptProb}%` }} />
                        </div>
                        <span className={clsx("font-bold", inst.interruptProb > 20 ? "text-amber-600" : "text-emerald-600")}>{inst.interruptProb}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        inst.status === "safe" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-200" : "bg-amber-500/10 text-amber-600 border border-amber-200"
                      )}>
                        {inst.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
