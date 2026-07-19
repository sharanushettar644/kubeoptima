"use client";

import { useState, useEffect } from "react";
import { Bell, Search, RefreshCw, Wifi } from "lucide-react";

export default function TopBar() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    // Enforce light mode class
    document.documentElement.className = "light";

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-border-custom flex items-center gap-4 px-6 sticky top-0 z-40 bg-surface/85 backdrop-blur transition-colors duration-200">
      
      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search clusters, workloads..."
          className="w-full bg-bg-app border border-border-custom rounded-lg pl-9 pr-3 py-2 text-xs text-text-main placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:bg-surface transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">⌘K</span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Live status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-500">Live</span>
        </div>

        {/* Connected clusters */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-app border border-border-custom">
          <Wifi className="w-3.5 h-3.5 text-indigo-650" />
          <span className="text-[11px] text-text-sub font-medium">3 clusters</span>
        </div>

        {/* Refresh */}
        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface hover:bg-slate-500/10 border border-border-custom transition-all cursor-pointer text-text-sub hover:text-text-main">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-surface hover:bg-slate-500/10 border border-border-custom transition-all cursor-pointer text-text-sub hover:text-text-main">
          <Bell className="w-3.5 h-3.5" />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Time */}
        <div className="text-[11px] text-slate-500 font-mono hidden md:block">
          {time}
        </div>
      </div>
    </header>
  );
}
