"use client";

import { useState, useEffect } from "react";
import { Settings, Shield, Key, Server, Bell, Database, Cloud, ChevronRight, CheckCircle, Globe } from "lucide-react";
import { clsx } from "clsx";

export default function SettingsPage() {
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/v1/clusters");
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((c: any) => ({
            name: c.name,
            provider: c.provider ? c.provider.toUpperCase() : "AWS",
            type: c.provider === "gcp" ? "GKE" : "EKS",
            nodes: c.nodes,
            version: c.nodes > 30 ? "1.36" : "1.35",
            status: c.status,
            mode: c.nodes > 35 ? "autonomous" : c.nodes > 20 ? "approval" : "observe",
          }));
          setClusters(mapped);
        }
      } catch (err) {
        setClusters([
          { name: "prod-us-east-1", provider: "AWS", type: "EKS", nodes: 42, version: "1.36", status: "connected", mode: "autonomous" },
          { name: "prod-us-west-2", provider: "AWS", type: "EKS", nodes: 28, version: "1.36", status: "connected", mode: "approval" },
          { name: "staging-eu-west-1", provider: "AWS", type: "EKS", nodes: 15, version: "1.35", status: "connected", mode: "observe" }
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
        <h1 className="text-3xl font-black tracking-tight text-text-main">Platform Settings</h1>
        <p className="text-sm text-text-sub mt-2">Clusters, policies, RBAC, integrations, and security configuration</p>
      </div>

      {/* Connected clusters */}
      <div className="rounded-xl border border-border-custom bg-surface p-6 shadow-card space-y-4">
        <h2 className="text-sm font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-650" /> Connected Clusters
        </h2>
        
        {loading ? (
          <div className="text-center py-6 text-text-sub text-xs">Loading clusters...</div>
        ) : (
          <div className="space-y-3.5">
            {clusters.map((cluster) => (
              <div key={cluster.name} className="flex items-center gap-4 p-4 rounded-xl bg-bg-app border border-border-custom hover:bg-slate-500/5 transition-all">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Cloud className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-text-main">{cluster.name}</div>
                  <div className="text-[11px] text-text-sub mt-0.5">{cluster.provider} {cluster.type} · {cluster.nodes} nodes · K8s {cluster.version}</div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{cluster.status}
                </div>
                <div className={clsx(
                  "px-2.5 py-1 rounded-lg text-[11px] font-bold border capitalize",
                  cluster.mode === "autonomous" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" :
                  cluster.mode === "approval" ? "bg-amber-500/10 border-amber-500/20 text-amber-600" :
                  "bg-slate-500/10 border-slate-500/20 text-slate-500"
                )}>
                  {cluster.mode}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
            <button className="w-full py-3 rounded-xl border border-dashed border-slate-300 text-xs font-bold text-slate-400 hover:text-indigo-650 hover:border-indigo-500/30 transition-all cursor-pointer">
              + Add Cluster
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Optimization policy */}
        <div className="rounded-xl border border-border-custom bg-surface p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-650" /> Optimization Policy
          </h2>
          <div className="space-y-4.5">
            {[
              { label: "Optimization Mode", value: "Autonomous", desc: "Apply safe recommendations automatically" },
              { label: "Safety Margin", value: "15%", desc: "Headroom above P99 for rightsizing" },
              { label: "Max Scale-Down", value: "50%", desc: "Maximum reduction in single action" },
              { label: "Rollback Timeout", value: "10 minutes", desc: "Auto-rollback if metrics degrade" },
              { label: "Spot Threshold", value: "<20% interrupt risk", desc: "Only migrate to spots below this threshold" },
            ].map((setting) => (
              <div key={setting.label} className="flex items-center justify-between py-2 border-b border-border-custom/50 last:border-0">
                <div>
                  <div className="text-xs font-bold text-text-main">{setting.label}</div>
                  <div className="text-[11px] text-text-sub mt-0.5">{setting.desc}</div>
                </div>
                <div className="text-xs font-mono font-bold text-indigo-650 bg-indigo-50 px-2.5 py-1 rounded">{setting.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Auth */}
        <div className="rounded-xl border border-border-custom bg-surface p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" /> Security & Authentication
          </h2>
          <div className="space-y-3.5">
            {[
              { name: "OIDC / SSO", status: "configured", provider: "Okta", icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
              { name: "mTLS Service Mesh", status: "enabled", provider: "Istio", icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
              { name: "Secrets Encryption", status: "enabled", provider: "AWS KMS", icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
              { name: "Audit Logging", status: "enabled", provider: "ClickHouse", icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
              { name: "RBAC", status: "configured", provider: "K8s Native", icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-3 py-2 border-b border-border-custom/50 last:border-0">
                {item.icon}
                <div className="flex-1">
                  <div className="text-xs font-bold text-text-main">{item.name}</div>
                  <div className="text-[11px] text-text-sub mt-0.5">{item.provider}</div>
                </div>
                <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded capitalize">{item.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="rounded-xl border border-border-custom bg-surface p-6 shadow-card space-y-4">
        <h2 className="text-sm font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-655" /> Integrations
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { name: "Prometheus", desc: "Metrics provider", status: "connected", color: "text-emerald-600 bg-emerald-50" },
            { name: "Grafana", desc: "Dashboards portal", status: "connected", color: "text-emerald-600 bg-emerald-50" },
            { name: "OpenTelemetry", desc: "Distributed tracing", status: "connected", color: "text-emerald-600 bg-emerald-50" },
            { name: "PagerDuty", desc: "On-call alerts", status: "connected", color: "text-emerald-600 bg-emerald-50" },
            { name: "Slack", desc: "Notifications", status: "connected", color: "text-emerald-600 bg-emerald-50" },
            { name: "JIRA", desc: "Ticket tracking", status: "connected", color: "text-emerald-600 bg-emerald-50" },
            { name: "Datadog", desc: "APM platform", status: "disconnected", color: "text-slate-400 bg-slate-50" },
            { name: "GitHub Actions", desc: "CI/CD triggers", status: "connected", color: "text-emerald-600 bg-emerald-50" },
          ].map((intg) => (
            <div key={intg.name} className="p-4 rounded-xl border border-border-custom bg-bg-app text-center space-y-1 hover:bg-slate-500/5 transition-all">
              <div className="text-xs font-bold text-text-main">{intg.name}</div>
              <div className="text-[10px] text-text-sub">{intg.desc}</div>
              <div className={clsx("inline-block text-[9px] font-bold px-2 py-0.5 rounded mt-2 capitalize", intg.color)}>
                {intg.status}
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
