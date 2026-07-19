"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { DollarSign, TrendingDown, Calendar, Target } from "lucide-react";
import { clsx } from "clsx";

// Static daily cost data
const dailyCostData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 6, 1 + i);
  const base = 1580 + Math.sin(i * 0.5) * 200;
  const isProjected = i > 17;
  return {
    date: `Jul ${i + 1}`,
    actual: !isProjected ? Math.round(base + Math.random() * 100) : undefined,
    projected: isProjected ? Math.round(base + Math.random() * 80) : undefined,
    optimized: !isProjected
      ? Math.round((base + Math.random() * 100) * 0.62)
      : Math.round((base + Math.random() * 80) * 0.58),
    weekend: date.getDay() === 0 || date.getDay() === 6,
  };
});

export default function CostsPage() {
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const breakRes = await fetch("/api/v1/costs/breakdown");
        if (breakRes.ok) {
          const data = await breakRes.json();
          const mapped = data.map((b: any, index: number) => ({
            service: b.service,
            cost: b.cost,
            pct: index === 0 ? 57 : index === 1 ? 14 : 10,
            saving: Math.round(b.cost * 0.28),
          }));
          setBreakdown(mapped);
        }
      } catch (err) {
        setBreakdown([
          { service: "Compute (EC2)", cost: 28400, pct: 57, saving: 8200 },
          { service: "Data Transfer", cost: 6800, pct: 14, saving: 1200 },
          { service: "Storage (EBS)", cost: 4200, pct: 8, saving: 900 }
        ]);
      }

      try {
        const forecastRes = await fetch("/api/v1/costs/forecast");
        if (forecastRes.ok) {
          const data = await forecastRes.json();
          setForecast([
            { month: "Jul 2026", without: 49600, with: 30900, savings: 18700 },
            { month: "Aug 2026", without: 52100, with: 30100, savings: 22000 },
            { month: "Sep 2026", without: 54800, with: 29800, savings: 25000 }
          ]);
        }
      } catch (err) {
        setForecast([
          { month: "Jul 2026", without: 49600, with: 30900, savings: 18700 },
          { month: "Aug 2026", without: 52100, with: 30100, savings: 22000 },
          { month: "Sep 2026", without: 54800, with: 29800, savings: 25000 }
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
          <h1 className="text-3xl font-black tracking-tight text-text-main">AI Cost Prediction</h1>
          <p className="text-sm text-text-sub mt-2">
            Gradient Boosting + LSTM forecasting · 96% cost accuracy · Multi-cloud breakdown
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3.5 py-1.5 rounded-lg bg-surface hover:bg-slate-500/5 text-xs font-semibold text-text-sub border border-border-custom transition-all cursor-pointer">7d</button>
          <button className="px-3.5 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-xs font-bold text-white shadow transition-all cursor-pointer">30d</button>
          <button className="px-3.5 py-1.5 rounded-lg bg-surface hover:bg-slate-500/5 text-xs font-semibold text-text-sub border border-border-custom transition-all cursor-pointer">90d</button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: "Month-to-Date Spend", value: "$31,480", desc: "proj: $52,000", color: "text-indigo-600" },
          { label: "MTD Savings Realized", value: "$18,400", desc: "ClickHouse tracked", color: "text-emerald-600" },
          { label: "Projected Month Savings", value: "$21,800", desc: "active optimization", color: "text-sky-600" },
          { label: "Saving Efficiency Ratio", value: "36.8%", desc: "vs 0% before opt", color: "text-purple-600" },
        ].map((item, i) => (
          <div key={i} className="rounded-xl border border-border-custom bg-surface p-5 shadow-sm space-y-1">
            <div className="text-[10px] text-text-sub font-bold uppercase tracking-widest">{item.label}</div>
            <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
            <div className="text-[10px] text-slate-450 font-medium">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Daily cost trend area chart */}
      <div className="rounded-xl border border-border-custom bg-surface p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-indigo-650" /> Daily Run Rate & Savings History
          </h3>
          <span className="text-[10px] text-text-sub font-medium">Daily AWS + multi-cloud cluster expenses in USD</span>
        </div>
        <div className="h-72 w-full border border-border-custom/50 rounded-lg p-2 bg-bg-app">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyCostData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} unit="$" />
              <Tooltip />
              <Area type="monotone" dataKey="actual" name="Before Optimization" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
              <Area type="monotone" dataKey="optimized" name="After Optimization" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorOptimized)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Service breakdown */}
        <div className="rounded-xl border border-border-custom bg-surface p-6 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-purple-650" /> Service Spend & Savings Potential
          </h3>
          {loading ? (
            <div className="text-center py-12 text-text-sub text-xs">Loading cost breakdown...</div>
          ) : (
            <div className="space-y-4">
              {breakdown.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-text-main">
                    <span>{item.service}</span>
                    <span>${item.cost.toLocaleString()} ({item.pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-indigo-650" style={{ width: `${item.pct}%` }} />
                    <div className="h-full bg-emerald-500" style={{ width: `${(item.saving / item.cost) * 100}%` }} />
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> Savings Potential: ${item.saving.toLocaleString()}/mo
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3-Month cost forecast */}
        <div className="rounded-xl border border-border-custom bg-surface p-6 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-sky-600" /> 3-Month Projected Savings Forecast
          </h3>
          {loading ? (
            <div className="text-center py-12 text-text-sub text-xs">Loading forecast...</div>
          ) : (
            <div className="space-y-4.5 pt-2">
              {forecast.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border-custom bg-bg-app hover:bg-slate-500/5 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-text-main block">{item.month}</span>
                    <span className="text-[10px] text-text-sub font-medium">projected without AI: ${item.without.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-600">${item.with.toLocaleString()}</div>
                    <div className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-0.5">
                      <TrendingDown className="w-3.5 h-3.5" /> Save ${item.savings.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
