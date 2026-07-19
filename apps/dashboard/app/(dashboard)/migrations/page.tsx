"use client";

import { useState, useEffect } from "react";
import { ArrowLeftRight, CheckCircle, Clock, Zap, Activity } from "lucide-react";
import { clsx } from "clsx";

export default function MigrationsPage() {
  const [migrationsList, setMigrationsList] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/v1/migrations");
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((m: any) => ({
            id: m.id,
            pod: m.pod,
            ns: m.namespace || "production",
            from: m.from || "node/ip-10-0-1-142",
            to: m.to || "node/ip-10-0-2-87",
            type: "live",
            status: m.status,
            progress: m.progress,
            reason: m.reason || "Source node CPU saturated (>90%)",
            startedAt: "2m ago",
            tcpSessions: 14,
            method: "CRIU Checkpoint/Restore",
          }));
          setMigrationsList(mapped);
          setSelected(mapped[0]);
        }
      } catch (err) {
        const fallback = [
          { id: "mig-001", pod: "api-server-6d4f8b-x2k9p", ns: "production", from: "node/ip-10-0-1-142", to: "node/ip-10-0-2-87", type: "live", status: "running", progress: 72, reason: "Source node CPU saturated (>90%)", startedAt: "2m ago", tcpSessions: 14, method: "CRIU Checkpoint/Restore" },
          { id: "mig-002", pod: "web-frontend-7c8d9-r4m1q", ns: "production", from: "node/ip-10-0-1-142", to: "node/ip-10-0-3-21", type: "live", status: "completed", progress: 100, reason: "Proactive: node drain scheduled", startedAt: "8m ago", tcpSessions: 3, method: "CRIU Checkpoint/Restore" },
          { id: "mig-003", pod: "batch-worker-5f7c-w9v2z", ns: "processing", from: "node/ip-10-0-2-99", to: "node/ip-10-0-1-204", type: "standard", status: "pending", progress: 0, reason: "AI: future overload predicted in 12m", startedAt: "Queued", tcpSessions: 0, method: "Rolling restart" }
        ];
        setMigrationsList(fallback);
        setSelected(fallback[0]);
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
          <h1 className="text-3xl font-black tracking-tight text-text-main">Live Pod Migration</h1>
          <p className="text-sm text-text-sub mt-2">
            Zero-downtime migration using CRIU checkpoint/restore · Kubernetes Descheduler · Scheduler Framework
          </p>
        </div>
        {migrationsList.some(m => m.status === "running") && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-650 font-bold text-xs animate-pulse">
            <Activity className="w-3.5 h-3.5" /> 1 migration in progress
          </div>
        )}
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: "Total Today", value: "23", trend: "completed", color: "text-indigo-600" },
          { label: "Live Migrations", value: "16", trend: "checkpointed", color: "text-sky-600" },
          { label: "Avg Duration", value: "38s", trend: "restore delay < 1s", color: "text-purple-600" },
          { label: "Zero Downtime", value: "100%", trend: "session preserved", color: "text-emerald-600" },
        ].map((item, i) => (
          <div key={i} className="rounded-xl border border-border-custom bg-surface p-5 shadow-sm space-y-1">
            <div className="text-[10px] text-text-sub font-bold uppercase tracking-widest">{item.label}</div>
            <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
            <div className="text-[10px] text-slate-450 font-medium">{item.trend}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-text-sub">Loading live migrations...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          
          {/* Left: Active & Recent list */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Active & Recent</div>
            
            {migrationsList.map((mig) => (
              <button
                key={mig.id}
                onClick={() => setSelected(mig)}
                className={clsx(
                  "w-full text-left rounded-xl p-4 border transition-all cursor-pointer shadow-sm",
                  selected?.id === mig.id
                    ? "bg-indigo-50 border-indigo-600/30"
                    : "bg-surface border-border-custom hover:bg-slate-500/5"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-text-main truncate">{mig.pod}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{mig.ns}</div>
                  </div>
                  <div className="text-right ml-2 shrink-0">
                    <span className={clsx(
                      "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                      mig.status === "running" ? "bg-indigo-600/10 text-indigo-600 border border-indigo-200" :
                      mig.status === "completed" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-200" :
                      "bg-slate-500/10 text-slate-500 border border-border-custom"
                    )}>
                      {mig.status}
                    </span>
                  </div>
                </div>

                {mig.status === "running" && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold text-indigo-650">
                      <span>Migration Progress</span>
                      <span>{mig.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${mig.progress}%` }} />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Right detail panel */}
          {selected && (
            <div className="col-span-2 space-y-6">
              <div className="rounded-xl border border-border-custom bg-surface p-6 shadow-card space-y-5">
                
                <div className="flex items-start justify-between pb-3 border-b border-border-custom/50">
                  <div>
                    <h2 className="text-base font-bold text-text-main leading-tight">{selected.pod}</h2>
                    <div className="text-[11px] text-text-sub font-mono mt-1">{selected.ns} • {selected.id}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-indigo-650 font-bold uppercase">
                    <Zap className="w-3.5 h-3.5 text-indigo-500" /> {selected.type} migration
                  </div>
                </div>

                {/* Routing nodes details */}
                <div className="grid grid-cols-3 items-center gap-4 py-4 px-5 rounded-lg border border-border-custom bg-bg-app">
                  <div className="text-center">
                    <span className="text-[9px] text-text-sub font-bold uppercase tracking-widest block mb-1">Source Node</span>
                    <strong className="text-xs text-red-600 font-mono">{selected.from}</strong>
                  </div>
                  <div className="flex flex-col items-center">
                    <ArrowLeftRight className="w-5 h-5 text-indigo-500" />
                    <span className="text-[9px] text-slate-450 mt-1 font-bold">Migration route</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-text-sub font-bold uppercase tracking-widest block mb-1">Target Node</span>
                    <strong className="text-xs text-emerald-600 font-mono">{selected.to}</strong>
                  </div>
                </div>

                {/* Info parameters grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Migration Method", value: selected.method },
                    { label: "TCP Sessions Preserved", value: selected.tcpSessions },
                    { label: "Trigger Reason", value: selected.reason },
                  ].map((p, i) => (
                    <div key={i} className="p-3 border border-border-custom/50 rounded-lg bg-bg-app text-center">
                      <div className="text-[9px] text-text-sub font-bold uppercase tracking-widest">{p.label}</div>
                      <div className="text-xs font-bold text-text-main mt-1">{p.value}</div>
                    </div>
                  ))}
                </div>

                {/* Stages tracking */}
                <div className="space-y-3.5 pt-2 border-t border-border-custom/50">
                  <h3 className="text-xs font-bold text-text-sub uppercase tracking-widest">CRIU Live Migration Stages</h3>
                  <div className="space-y-3">
                    {[
                      { stage: "Pre-dump", desc: "Capture dirty memory pages without stopping", done: true },
                      { stage: "Checkpoint", desc: "Freeze process, dump full state (TCP, FDs, memory)", done: true },
                      { stage: "Transfer", desc: "Move image to target node via RDMA/NFS", done: true },
                      { stage: "Restore", desc: "Restart process from checkpoint on target node", done: selected.status === "completed" },
                      { stage: "Health Check", desc: "Validate liveness & readiness probes pass", done: selected.status === "completed" },
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={clsx(
                          "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                          step.done ? "bg-emerald-500/10 text-emerald-600 border border-emerald-300" : "bg-slate-200 text-slate-400 border border-slate-300"
                        )}>
                          {step.done ? <CheckCircle className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                        </div>
                        <div>
                          <span className={clsx("text-xs font-bold", step.done ? "text-text-main" : "text-slate-400")}>{step.stage}</span>
                          <p className="text-[10px] text-slate-450 leading-relaxed mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
