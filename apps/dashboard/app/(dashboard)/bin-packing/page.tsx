"use client";

import { useState } from "react";
import { Grid3X3, ArrowRight, Cpu, MemoryStick } from "lucide-react";
import { clsx } from "clsx";

// Simulated node grid for bin packing visualization
const generateNodes = (count: number, optimized: boolean) =>
  Array.from({ length: count }, (_, i) => {
    const cpuBase = optimized
      ? 55 + Math.random() * 30
      : 20 + Math.random() * 60;
    const memBase = optimized
      ? 58 + Math.random() * 28
      : 18 + Math.random() * 65;
    return {
      id: `node-${i + 1}`,
      cpu: Math.round(cpuBase),
      mem: Math.round(memBase),
      pods: optimized ? Math.round(8 + Math.random() * 7) : Math.round(3 + Math.random() * 12),
      zone: ["us-east-1a", "us-east-1b", "us-east-1c"][i % 3],
      type: ["m5.2xlarge", "m5.4xlarge", "c5.2xlarge"][i % 3],
      status: Math.random() > 0.15 ? "ready" : "pressure",
    };
  });

const beforeNodes = generateNodes(18, false);
const afterNodes = generateNodes(12, true);

function NodeCell({ node, size = "normal" }: { node: ReturnType<typeof generateNodes>[0], size?: "normal" | "small" }) {
  const cpuColor =
    node.cpu > 80 ? "bg-red-500" :
    node.cpu > 60 ? "bg-amber-500" : "bg-indigo-600";
  const memColor =
    node.mem > 85 ? "bg-red-500" :
    node.mem > 65 ? "bg-amber-500" : "bg-purple-650";

  return (
    <div className={clsx(
      "relative rounded-lg border transition-all hover:scale-[1.03] cursor-pointer group shadow-sm bg-surface p-3",
      node.status === "pressure"
        ? "border-red-200 bg-red-50/20"
        : "border-border-custom hover:border-indigo-500/30"
    )}>
      <div className="text-[9px] font-mono text-slate-450 truncate mb-1">{node.id}</div>
      {/* Mini bars */}
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <div className="w-6 text-[8px] text-text-sub font-bold uppercase">CPU</div>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${cpuColor}`} style={{ width: `${node.cpu}%` }} />
          </div>
          <div className="text-[9px] text-text-sub w-6 text-right font-medium">{node.cpu}%</div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 text-[8px] text-text-sub font-bold uppercase">MEM</div>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${memColor}`} style={{ width: `${node.mem}%` }} />
          </div>
          <div className="text-[9px] text-text-sub w-6 text-right font-medium">{node.mem}%</div>
        </div>
      </div>
      
      {/* Tooltip detail hover popup */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-40 p-2 bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-30 leading-relaxed">
        <div><strong>Type:</strong> {node.type}</div>
        <div><strong>Zone:</strong> {node.zone}</div>
        <div><strong>Pods:</strong> {node.pods} active</div>
        <div><strong>Status:</strong> <span className={node.status === "pressure" ? "text-red-400" : "text-emerald-400"}>{node.status}</span></div>
      </div>
    </div>
  );
}

export default function BinPackingPage() {
  const [optimized, setOptimized] = useState(false);
  const currentNodes = optimized ? afterNodes : beforeNodes;

  return (
    <div className="py-4 max-w-7xl mx-auto space-y-8 text-text-main transition-colors duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-main">AI Bin Packing & Consolidation</h1>
          <p className="text-sm text-text-sub mt-2">
            Consolidates scattered workloads onto fewer nodes using genetic packing models
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOptimized(false)}
            className={clsx(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
              !optimized ? "bg-indigo-650 text-white shadow" : "bg-surface hover:bg-slate-500/5 text-text-sub border border-border-custom"
            )}
          >
            Before Optimization
          </button>
          <button
            onClick={() => setOptimized(true)}
            className={clsx(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
              optimized ? "bg-indigo-650 text-white shadow" : "bg-surface hover:bg-slate-500/5 text-text-sub border border-border-custom"
            )}
          >
            After Optimization (AI Packed)
          </button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: "Total Nodes", value: currentNodes.length, sub: optimized ? "12 nodes packed" : "18 nodes scattered", color: "text-indigo-600" },
          { label: "Avg Cluster CPU", value: optimized ? "71%" : "38%", sub: "utilization rate", color: "text-sky-600" },
          { label: "Avg Cluster Memory", value: optimized ? "73%" : "41%", sub: "utilization rate", color: "text-purple-600" },
          { label: "Potential Savings", value: optimized ? "$0.00" : "$3,410/mo", sub: "6 nodes consolidable", color: "text-emerald-600" },
        ].map((item, i) => (
          <div key={i} className="rounded-xl border border-border-custom bg-surface p-5 shadow-sm space-y-1">
            <div className="text-[10px] text-text-sub font-bold uppercase tracking-widest">{item.label}</div>
            <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
            <div className="text-[10px] text-slate-450 font-medium">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Grid container */}
      <div className="rounded-xl border border-border-custom bg-surface p-6 shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-border-custom/50 pb-3">
          <h3 className="text-sm font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
            <Grid3X3 className="w-4 h-4 text-indigo-650" /> Node Pool Placement Visualization
          </h3>
          <span className="text-[10px] text-text-sub font-semibold">Hover over nodes to inspect details</span>
        </div>

        {/* Node Grid */}
        <div className="grid grid-cols-4 gap-4">
          {currentNodes.map((node) => (
            <NodeCell key={node.id} node={node} />
          ))}
        </div>
      </div>

      {/* Optimization policy summary */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <InfoIcon className="w-5 h-5 text-indigo-650 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-sm font-bold text-indigo-750">AI Bin Packing Constraints & Safeties</div>
            <p className="text-xs text-text-sub leading-relaxed">
              Our bin packing algorithm coordinates scheduling rules, anti-affinity taints, pod disruption budgets (PDB), and topology spread requirements. Workloads are packed tightly without violating redundancy bounds, achieving max cost savings while guaranteeing high availability SLA.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
