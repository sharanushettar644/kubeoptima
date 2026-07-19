"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Cpu, Zap, Activity, ShieldAlert, Sparkles, Terminal, Code, Settings, HelpCircle, CheckCircle2 } from "lucide-react";

export default function SolutionsPage() {
  const [activeTab, setActiveTab] = useState<"rightsizing" | "autoscaling" | "spot" | "gpu">("rightsizing");

  const tabContents = {
    rightsizing: {
      title: "Workload Rightsizing",
      description: "Tunes pod CPU and memory requests at the millicore level based on actual historic and predictive usage models. Eliminates application developer overprovisioning without sacrificing stability.",
      stats: { primary: "-37%", label: "Average CPU Waste Reduction" },
      features: ["App-aware vertical scaling", "Noisy neighbor protection", "Zero-downtime rolling updates", "Memory leak buffer safety"]
    },
    autoscaling: {
      title: "Autoscaling & Bin Packing",
      description: "Aggressively packs Kubernetes pods onto minimal compute resources. Scales down empty machines instantly and provisions new nodes in seconds using high-performance spot/on-demand instances.",
      stats: { primary: "15s", label: "Average Node Spinup Time" },
      features: ["Predictive request scaling", "Cross-zone packing optimization", "Auto-cleanup of empty node groups", "Taint & Toleration awareness"]
    },
    spot: {
      title: "Spot Instance Orchestration",
      description: "Runs production-grade workloads on cheap spot instances with absolute safety. Our ML model predicts spot termination signals up to 30 minutes in advance and coordinates graceful evacuations.",
      stats: { primary: "99.99%", label: "Guaranteed Spot Availability" },
      features: ["Early preemption warnings", "Automated fallback to on-demand", "Stateful set support", "Graceful draining & rescheduling"]
    },
    gpu: {
      title: "GPU Cost Optimization",
      description: "Maximizes specialized hardware returns. Partitions and fractionates massive GPU clusters so multiple containerized AI training and inference steps can share the same GPU safely.",
      stats: { primary: "5x", label: "Higher GPU Utilization" },
      features: ["Fractional GPU partitioning", "Dynamic resource isolation", "CUDA slice enforcement", "Instant AI workspace spinup"]
    }
  };

  return (
    <div className="space-y-20 pb-20 bg-background-custom text-on-surface transition-colors duration-200">
      
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-12 md:pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary font-[family-name:var(--font-mono)] mb-6">
              <Sparkles size={12} className="animate-spin" />
              Autonomous Cluster Intelligence
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-[family-name:var(--font-title)] mb-6">
              Infrastructure Optimization. <br />
              <span className="bg-gradient-to-r from-primary to-[#0669fd] bg-clip-text text-transparent">
                On Autopilot.
              </span>
            </h1>
            <p className="text-lg text-on-surface-variant mb-8 leading-relaxed max-w-xl">
              Turn Kubernetes signals into safe automated actions. Reduce overprovisioning by up to 70% without trading off reliability or starving applications.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="bg-primary-container text-white px-6 py-3.5 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-all font-[family-name:var(--font-title)] shadow-lg shadow-primary-container/20"
              >
                Start Free Trial
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/pricing"
                className="border border-outline/20 text-on-surface px-6 py-3.5 rounded-lg font-bold hover:bg-surface-container transition-colors font-[family-name:var(--font-title)]"
              >
                See Pricing Plans
              </Link>
            </div>
          </div>

          {/* Real-time Usage Chart mockup */}
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative bg-surface-elevated border border-outline/10 p-6 md:p-8 rounded-2xl shadow-2xl space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[10px] text-on-surface-variant/50 mb-1">CLUSTER-ID: US-EAST-1A</p>
                  <h3 className="font-[family-name:var(--font-title)] text-lg font-bold">Real-time Utilization</h3>
                </div>
                <div className="text-right">
                  <p className="text-success-emerald font-extrabold text-lg font-[family-name:var(--font-title)]">-$4,281/mo</p>
                  <p className="font-[family-name:var(--font-mono)] text-[10px] text-on-surface-variant/50 font-semibold">Savings Potential</p>
                </div>
              </div>
              
              <div className="h-40 flex items-end gap-2 px-2 border-b border-outline/10 mb-4">
                <div className="flex-1 bg-primary/20 rounded-t-sm h-[40%]"></div>
                <div className="flex-1 bg-primary/45 rounded-t-sm h-[65%]"></div>
                <div className="flex-1 bg-primary/20 rounded-t-sm h-[30%]"></div>
                <div className="flex-1 bg-primary/60 rounded-t-sm h-[85%]"></div>
                <div className="flex-1 bg-primary/30 rounded-t-sm h-[45%]"></div>
                <div className="flex-1 bg-primary/50 rounded-t-sm h-[70%]"></div>
                <div className="flex-1 bg-primary rounded-t-sm h-[95%] relative">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-surface border border-outline/10 px-2 py-0.5 rounded text-[8px] font-bold font-[family-name:var(--font-mono)] whitespace-nowrap">Current Peak</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-background-custom rounded-lg border border-outline/10">
                  <p className="font-[family-name:var(--font-mono)] text-[10px] text-on-surface-variant/50 uppercase">CPU Requested</p>
                  <p className="font-bold text-base font-[family-name:var(--font-title)] mt-0.5">482 Cores</p>
                </div>
                <div className="p-3 bg-background-custom rounded-lg border border-outline/10">
                  <p className="font-[family-name:var(--font-mono)] text-[10px] text-on-surface-variant/50 uppercase">Mem Provisioned</p>
                  <p className="font-bold text-base font-[family-name:var(--font-title)] mt-0.5">1.2 TB</p>
                </div>
                <div className="p-3 bg-background-custom rounded-lg border border-outline/10">
                  <p className="font-[family-name:var(--font-mono)] text-[10px] text-on-surface-variant/50 uppercase">Idle Waste</p>
                  <p className="font-bold text-base font-[family-name:var(--font-title)] text-error mt-0.5">32%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Solutions Tabs */}
      <section className="max-w-7xl mx-auto px-6 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold font-[family-name:var(--font-title)] tracking-tight">Four mechanisms of complete orchestration</h2>
          <p className="text-sm text-on-surface-variant">Click to explore each feature layer optimized by our platform.</p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border border-outline/10 rounded-xl p-1 bg-surface-container-lowest/30">
          {(Object.keys(tabContents) as Array<keyof typeof tabContents>).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-3.5 rounded-lg text-sm font-semibold transition-all font-[family-name:var(--font-title)] ${
                activeTab === key
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              {tabContents[key].title}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="grid md:grid-cols-12 gap-8 bg-surface-elevated border border-outline/10 rounded-2xl p-6 md:p-8 items-center">
          <div className="md:col-span-7 space-y-6">
            <h3 className="text-2xl font-bold font-[family-name:var(--font-title)]">{tabContents[activeTab].title}</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">{tabContents[activeTab].description}</p>
            <div className="grid grid-cols-2 gap-4">
              {tabContents[activeTab].features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-5 bg-background-custom border border-outline/10 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-2 py-10">
            <span className="font-[family-name:var(--font-mono)] text-xs text-on-surface-variant/50 uppercase tracking-widest">
              {tabContents[activeTab].stats.label}
            </span>
            <span className="text-4xl md:text-5xl font-black text-primary font-[family-name:var(--font-title)]">
              {tabContents[activeTab].stats.primary}
            </span>
            <div className="w-12 h-1 bg-primary/20 rounded-full mt-4" />
          </div>
        </div>
      </section>

      {/* Operator Declarative configuration YAML */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 space-y-6">
            <h2 className="text-3xl font-extrabold font-[family-name:var(--font-title)] tracking-tight">
              App-driven setup. Controlled via custom resource definitions.
            </h2>
            <p className="text-on-surface-variant leading-relaxed">
              Connect your cluster using our lightweight k8s-operator. Configure rightsizing policies, preemption limits, and node sizing targets via standard YAML declarations in git.
            </p>
            <div className="space-y-4">
              {[
                { title: "Declarative Policies", desc: "No complex dashboards required for configuration. Change settings via pull request." },
                { title: "Dry-Run Simulation", desc: "Test optimization rules in read-only mode to see cost effects before activating writes." },
                { title: "RBAC & Namespace Limits", desc: "Restrict rightsizing actions to specific teams, environments, or namespaces." }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm font-[family-name:var(--font-title)]">{item.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="bg-[#0b0c10] border border-outline/10 rounded-2xl p-5 md:p-6 shadow-2xl space-y-4 font-[family-name:var(--font-mono)] text-xs text-[#e3e2e7]">
              <div className="flex items-center justify-between border-b border-outline/10 pb-3">
                <div className="flex items-center gap-1.5">
                  <Code size={14} className="text-on-surface-variant/40" />
                  <span className="font-bold tracking-widest text-[9px] text-on-surface-variant/50 uppercase">YAML Configuration</span>
                </div>
                <span className="text-[9px] bg-primary-container/20 text-primary px-2 py-0.5 rounded border border-primary/30">CRD v1alpha1</span>
              </div>
              <pre className="overflow-x-auto text-[11px] leading-relaxed text-[#c2c6d8] scrollbar-thin">
{`apiVersion: kubeoptima.ai/v1alpha1
kind: WorkloadAutoscaler
metadata:
  name: core-api-optimizer
  namespace: production
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: core-api
  mode: Autopilot # Safe writes activated
  policies:
    rightsizing:
      cpu:
        minAllowed: 100m
        maxAllowed: 4000m
      memory:
        minAllowed: 256Mi
        maxAllowed: 8Gi
    spotMigration:
      preemptionWindow: 30m
      fallback: OnDemand`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Large Bottom CTA */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0669fd10,transparent_60%)] pointer-events-none" />
          <h2 className="text-3xl font-extrabold text-on-surface max-w-xl mx-auto leading-tight font-[family-name:var(--font-title)]">
            Ready to optimize your cluster resources?
          </h2>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto">
            Connect in under 10 minutes in read-only mode to visualize your potential savings.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3 text-sm font-bold text-white bg-primary-container hover:opacity-90 rounded-lg shadow-lg shadow-primary-container/20 transition-all duration-200"
            >
              Connect Cluster Free
            </Link>
            <Link
              href="/resources"
              className="px-6 py-3 text-sm font-bold text-on-surface bg-surface-elevated hover:bg-surface border border-outline/10 rounded-lg shadow-sm transition-all duration-200"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
