"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Terminal, Clipboard, Check, CheckCircle2, Cpu, ShieldAlert, Sparkles } from "lucide-react";

export default function ResourcesPage() {
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("curl -sSL https://cli.kubeoptima.ai/install.sh | sh");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      num: 1,
      title: "Connect & Observe",
      badge: "READY IN 2m",
      desc: "Deploy our lightweight read-only agent to your EKS, GKE, or AKS clusters in minutes with a single helm command. Zero configuration, zero restart requirements."
    },
    {
      num: 2,
      title: "Analyze & Forecast",
      badge: "ANALYSIS ACTIVE",
      desc: "Our machine learning models analyze cluster historical load, container limits, and CPU usage patterns to identify idle compute resources and overprovisioning."
    },
    {
      num: 3,
      title: "Orchestrate & Automate",
      badge: "SCALING ONLINE",
      desc: "Once writes are approved, KubeOptimize automatically rightsizes workloads at the pod level and rebalances Karpenter nodes in real time to match demand."
    },
    {
      num: 4,
      title: "Continuous Feedback",
      badge: "AUTOPILOT ONLINE",
      desc: "Close the optimization loop. The platform continuously monitors application latency and SLA targets to guarantee cost reductions do not impact reliability."
    }
  ];

  return (
    <div className="space-y-20 pb-20 bg-background-custom text-on-surface transition-colors duration-200">
      
      {/* Hero Header */}
      <header className="max-w-7xl mx-auto px-6 pt-12 md:pt-20 space-y-4">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary font-[family-name:var(--font-mono)]">
          Engineered Efficiency
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-[family-name:var(--font-title)] text-on-surface">
          Automated Kubernetes Lifecycle. <br />
          <span className="bg-gradient-to-r from-primary to-[#0669fd] bg-clip-text text-transparent">
            How it Works.
          </span>
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl">
          KubeOptimize closes the loop between Kubernetes signals and reliable automated action. No more manual YAML tuning or dashboard stitching.
        </p>
      </header>

      {/* Chronological Steps */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((step) => (
          <button
            key={step.num}
            onClick={() => setActiveStep(step.num)}
            className={`flex flex-col justify-between p-6 bg-surface-elevated border rounded-2xl text-left transition-all space-y-6 ${
              activeStep === step.num
                ? "border-primary shadow-lg ring-1 ring-primary/20"
                : "border-outline/10 hover:border-outline/30"
            }`}
          >
            <div className="space-y-3">
              <span className="font-[family-name:var(--font-mono)] text-sm font-bold text-primary">
                0{step.num}
              </span>
              <h3 className="text-lg font-bold font-[family-name:var(--font-title)] text-on-surface">
                {step.title}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {step.desc}
              </p>
            </div>
            <div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-primary/10 border border-primary/20 text-primary font-[family-name:var(--font-mono)] uppercase">
                {step.badge}
              </span>
            </div>
          </button>
        ))}
      </section>

      {/* CLI terminal connect widget */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 space-y-6">
            <h2 className="text-3xl font-extrabold font-[family-name:var(--font-title)] tracking-tight">
              Connect a cluster via our unified CLI
            </h2>
            <p className="text-on-surface-variant leading-relaxed">
              Start optimizing in read-only mode by pasting our installation script into your terminal window. The agent runs as a minimal deployment with zero master node requirements.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-on-surface-variant">Zero changes to running application pods or deployments</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-on-surface-variant">SOC2 compliant control loops with read-only defaults</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-on-surface-variant">Compatible with Karpenter, Cluster Autoscaler, and static clusters</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-6">
            <div className="bg-[#0b0c10] border border-outline/10 rounded-2xl p-5 md:p-6 shadow-2xl space-y-4 text-xs text-[#e3e2e7] font-[family-name:var(--font-mono)]">
              <div className="flex items-center justify-between border-b border-outline/10 pb-3">
                <div className="flex items-center gap-1.5">
                  <Terminal size={14} className="text-on-surface-variant/40" />
                  <span className="font-bold tracking-widest text-[9px] text-on-surface-variant/50 uppercase">KUBEOPTIMA TERMINAL</span>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="p-1 rounded hover:bg-outline/10 text-on-surface-variant/60 hover:text-white transition-colors"
                  title="Copy command"
                >
                  {copied ? <Check size={14} className="text-success-emerald" /> : <Clipboard size={14} />}
                </button>
              </div>
              
              <div className="space-y-3 font-[family-name:var(--font-mono)] text-[11px]">
                <p className="text-on-surface-variant/45"># Step 1: Install CLI tool</p>
                <div className="flex items-center justify-between bg-surface-container-lowest/5 border border-outline/5 p-2 rounded">
                  <span className="text-primary select-all">curl -sSL https://cli.kubeoptima.ai/install.sh | sh</span>
                </div>
                
                <p className="text-on-surface-variant/45 pt-1"># Step 2: Register agent on cluster</p>
                <p className="text-on-surface">&gt; kubeoptima register --token=ko_88a9df28e3 --cluster=prod-cluster</p>
                
                <p className="text-on-surface-variant/45 pt-1"># Step 3: Run dry-run cost analysis</p>
                <p className="text-on-surface">&gt; kubeoptima analyze --dry-run</p>
                <p className="text-success-emerald font-bold">&gt; Ready! Optimization potential found: -42.8% (-$4,281/mo)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Rebalance Banner */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0669fd10,transparent_60%)] pointer-events-none" />
          <h2 className="text-3xl font-extrabold text-on-surface max-w-xl mx-auto leading-tight font-[family-name:var(--font-title)]">
            Explore KubeOptimize Architecture
          </h2>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto">
            Learn more about our agentic execution loop, ClickHouse log architecture, and Operator controller logic in the developer docs.
          </p>
          <div className="flex justify-center pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-primary-container hover:opacity-90 rounded-lg shadow-lg shadow-primary-container/20 transition-all duration-200"
            >
              Start Free Trial
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
