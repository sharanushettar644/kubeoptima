"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  Server,
  Cloud,
  DollarSign,
  Globe,
  Cpu,
  TrendingUp,
  Brain,
  Settings,
  HelpCircle,
  FileText,
  Activity,
  ChevronDown,
  Boxes,
  Compass,
} from "lucide-react";

const navItems = [
  {
    group: "Organization",
    items: [
      { href: "/dashboard", label: "Cluster List", icon: Server },
      { href: "/spot", label: "Cloud VMs", icon: Cloud },
      { href: "/costs", label: "Cost monitoring", icon: DollarSign },
      { href: "/migrations", label: "Network Intelligence", icon: Globe },
    ],
  },
  {
    group: "Optimization",
    items: [
      { href: "/rightsizing", label: "AI Rightsizing", icon: Cpu },
      { href: "/autoscaling", label: "Predictive Scaling", icon: TrendingUp },
      { href: "/recommendations", label: "Explainable AI", icon: Brain },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col bg-surface border-r border-border-custom shrink-0 transition-colors duration-200">
      
      {/* Top Header & Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-custom">
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Boxes className="w-4.5 h-4.5 text-white" />
          </div>
        </div>
        <div>
          <div className="font-bold text-text-main text-sm tracking-tight leading-none">KubeOptima</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">AI Platform</div>
        </div>
      </div>

      {/* Automation Brand Hub */}
      <div className="px-5 py-4 flex items-center gap-3 border-b border-border-custom/50 bg-slate-500/5">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <Compass className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-text-main leading-tight">Automation</div>
          <div className="text-[10px] text-slate-400 truncate">Optimize infrastructure</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin space-y-5">
        {navItems.map((group) => (
          <div key={group.group}>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
              {group.group}
            </div>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group relative",
                      isActive
                        ? "bg-indigo-600/10 text-indigo-600 dark:text-white"
                        : "text-text-sub hover:text-text-main hover:bg-slate-500/5"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500 rounded-r-full" />
                    )}
                    <Icon
                      className={clsx(
                        "w-4 h-4 transition-colors shrink-0",
                        isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-text-main"
                      )}
                    />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Docs & Help Footer links */}
      <div className="px-3 py-2 border-t border-border-custom/50 space-y-0.5">
        <a
          href="/docs"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-text-sub hover:text-text-main hover:bg-slate-500/5 transition-all"
        >
          <FileText className="w-4 h-4 text-slate-400" />
          Docs
        </a>
        <a
          href="/help"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-text-sub hover:text-text-main hover:bg-slate-500/5 transition-all"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          Help
        </a>
      </div>

      {/* Profile Footer */}
      <div className="p-4 border-t border-border-custom flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            PO
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-text-main truncate leading-none">Platform Ops</div>
            <div className="text-[9px] text-slate-400 truncate mt-0.5">admin@company.io</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
