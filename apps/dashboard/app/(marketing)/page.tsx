"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Activity, Cpu, Check, Terminal, Users, CheckCircle2, ChevronRight, Sparkles, Zap, Award } from "lucide-react";

export default function PlatformLandingPage() {
  const [clusterInfo, setClusterInfo] = useState({
    id: "US-EAST-1A",
    cpu: "482 Cores",
    mem: "1.2 TB",
    waste: "32%",
    potential: "-$4,281/mo",
  });

  useEffect(() => {
    const fetchClusterData = async () => {
      try {
        const res = await fetch("/api/v1/clusters");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const mainCluster = data[0];
            setClusterInfo({
              id: mainCluster.id.toUpperCase(),
              cpu: `${mainCluster.nodes * 2} Cores`,
              mem: `${mainCluster.nodes * 2.0} GB`,
              waste: "14%",
              potential: "-$128/mo",
            });
          }
        }
      } catch (err) {
        // Fallback to defaults shown in mockup
      }
    };
    fetchClusterData();
  }, []);

  const barData = [40, 65, 30, 85, 45, 70, 95];

  return (
    <div className="space-y-20 pb-20 overflow-hidden bg-background-custom text-on-surface transition-colors duration-200">
      
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 md:pt-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side: Headline */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary font-[family-name:var(--font-mono)]">
              <Zap size={12} className="text-primary animate-pulse" />
              Autonomous Cloud Intelligence
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-[family-name:var(--font-title)] text-on-surface">
              Application Performance and Kubernetes{" "}
              <span className="bg-gradient-to-r from-primary to-[#0669fd] bg-clip-text text-transparent">
                Automation. On autopilot.
              </span>
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl">
              Turn Kubernetes workload, infrastructure, and cost signals into safe automated actions. Rightsizing pods, scaling nodes, and fixing issues without manual tuning.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-white bg-primary-container hover:opacity-90 rounded-lg shadow-lg shadow-primary-container/20 transition-all duration-200 hover:-translate-y-[1px] font-[family-name:var(--font-title)]"
              >
                Start free trial
                <ArrowRight size={18} />
              </Link>
              <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
                <CheckCircle2 size={16} className="text-success-emerald shrink-0" />
                <span>Connects in minutes. Zero changes required.</span>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive Card */}
          <div className="lg:col-span-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative bg-surface-elevated border border-outline/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 overflow-hidden transition-all duration-200 hover:border-primary/30">
              {/* Header info */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant/50 tracking-wider font-[family-name:var(--font-mono)] uppercase">
                    CLUSTER-ID: {clusterInfo.id}
                  </p>
                  <h3 className="text-lg font-bold text-on-surface font-[family-name:var(--font-title)]">
                    Real-time Utilization
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-success-emerald font-[family-name:var(--font-title)]">
                    {clusterInfo.potential}
                  </p>
                  <p className="text-[10px] font-semibold text-on-surface-variant/50 tracking-wider font-[family-name:var(--font-mono)] uppercase">
                    Optimization Potential
                  </p>
                </div>
              </div>

              {/* Utilisation Chart mockup */}
              <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-outline/10 pb-6 relative">
                {barData.map((val, idx) => {
                  const isLast = idx === barData.length - 1;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 relative ${
                          isLast
                            ? "bg-primary shadow-lg shadow-primary/20"
                            : "bg-primary/20 hover:bg-primary/35"
                        }`}
                        style={{ height: `${val}%` }}
                      >
                        {isLast && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface-elevated text-[9px] font-bold border border-outline/10 text-on-surface px-2 py-0.5 rounded shadow">
                            Current Peak
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Metadata Bottom Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-background-custom border border-outline/10 rounded-lg">
                  <p className="text-[9px] font-bold text-on-surface-variant/50 tracking-wider uppercase font-[family-name:var(--font-mono)]">
                    CPU Requested
                  </p>
                  <p className="text-base font-extrabold text-on-surface mt-1 font-[family-name:var(--font-title)]">
                    {clusterInfo.cpu}
                  </p>
                </div>
                <div className="p-3 bg-background-custom border border-outline/10 rounded-lg">
                  <p className="text-[9px] font-bold text-on-surface-variant/50 tracking-wider uppercase font-[family-name:var(--font-mono)]">
                    Mem Provisioned
                  </p>
                  <p className="text-base font-extrabold text-on-surface mt-1 font-[family-name:var(--font-title)]">
                    {clusterInfo.mem}
                  </p>
                </div>
                <div className="p-3 bg-background-custom border border-outline/10 rounded-lg">
                  <p className="text-[9px] font-bold text-on-surface-variant/50 tracking-wider uppercase font-[family-name:var(--font-mono)]">
                    Idle Waste
                  </p>
                  <p className="text-base font-extrabold text-error mt-1 font-[family-name:var(--font-title)]">
                    {clusterInfo.waste}
                  </p>
                </div>
              </div>
              
              <div className="absolute bottom-4 right-4 bg-primary text-on-primary-container font-[family-name:var(--font-mono)] text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-primary/20">
                AUTOPILOT: ON
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-10 border-y border-outline/10 bg-surface-container-lowest/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest mb-6 font-[family-name:var(--font-mono)]">
            Trusted by 2,100+ cloud teams globally
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60">
            <span className="text-lg font-bold font-[family-name:var(--font-mono)] tracking-wider">NETFLIX</span>
            <span className="text-lg font-bold font-[family-name:var(--font-mono)] tracking-wider">AXON</span>
            <span className="text-lg font-bold font-[family-name:var(--font-mono)] tracking-wider">VERBIT</span>
            <span className="text-lg font-bold font-[family-name:var(--font-mono)] tracking-wider">UBER</span>
            <span className="text-lg font-bold font-[family-name:var(--font-mono)] tracking-wider">STRIPE</span>
          </div>
        </div>
      </section>

      {/* Bento Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-primary uppercase tracking-widest font-[family-name:var(--font-mono)]">
            Continuous optimization
          </span>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight font-[family-name:var(--font-title)]">
            One Kubernetes control loop for performance, reliability, and cost.
          </h2>
          <p className="text-on-surface-variant text-sm">
            Continuously learning how workloads behave, then safely optimizing your entire stack.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Application Performance */}
          <div className="md:col-span-8 bg-surface-elevated border border-outline/10 rounded-2xl p-6 md:p-8 flex flex-col justify-between overflow-hidden relative group hover:border-primary/30 transition-all">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Cpu size={20} />
              </div>
              <h3 className="text-xl font-bold text-on-surface font-[family-name:var(--font-title)]">
                Application Performance
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-md">
                Adjusts CPU and memory at the millicore level to prevent resource starvation, maintaining performance and SLOs dynamically.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-outline/10 flex items-center gap-2 text-xs font-semibold text-on-surface-variant/60 font-[family-name:var(--font-mono)] uppercase">
              <Award size={14} className="text-primary" />
              SLA-Aware Rightsizing
            </div>
          </div>

          {/* Card 2: Cost Efficiency */}
          <div className="md:col-span-4 bg-surface-elevated border border-outline/10 rounded-2xl p-6 md:p-8 flex flex-col justify-between group hover:border-primary/30 transition-all">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-success-emerald/10 border border-success-emerald/20 flex items-center justify-center text-success-emerald">
                <Activity size={20} />
              </div>
              <h3 className="text-xl font-bold text-on-surface font-[family-name:var(--font-title)]">
                Cost Efficiency
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Cut cloud spending by up to 60% with automated right-sized bin packing and scheduling.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-outline/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant/60 font-[family-name:var(--font-mono)] uppercase">
                AVG SAVINGS
              </span>
              <span className="text-xl font-black text-success-emerald font-[family-name:var(--font-title)]">
                -64.2%
              </span>
            </div>
          </div>

          {/* Card 3: Reliability */}
          <div className="md:col-span-4 bg-surface-elevated border border-outline/10 rounded-2xl p-6 md:p-8 flex flex-col justify-between group hover:border-primary/30 transition-all">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Shield size={20} />
              </div>
              <h3 className="text-xl font-bold text-on-surface font-[family-name:var(--font-title)]">
                Reliability
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Predicts spot interruptions 30 minutes before they happen, migrating pods gracefully.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-outline/10 flex items-center gap-2 text-xs font-semibold text-on-surface-variant/60 font-[family-name:var(--font-mono)] uppercase">
              <div className="w-2 h-2 bg-success-emerald rounded-full animate-pulse" />
              99.99% Uptime Guarantee
            </div>
          </div>

          {/* Card 4: Intelligence */}
          <div className="md:col-span-8 bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Sparkles size={20} />
              </div>
              <h3 className="text-xl font-bold text-on-surface font-[family-name:var(--font-title)]">
                Precision Rightsizing Intelligence
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed max-w-lg">
                The KubeOptimize engine analyzes the DNA of application demand, continuously adapting to your workloads instead of relying on static configurations.
              </p>
              <div className="pt-2">
                <Link
                  href="/solutions"
                  className="text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  Explore the Engine
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Optimization Process Section */}
      <section className="py-16 bg-surface-container-lowest/30 border-y border-outline/10">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-md mx-auto space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-widest font-[family-name:var(--font-mono)]">
              How it works
            </span>
            <h2 className="text-3xl font-extrabold text-on-surface font-[family-name:var(--font-title)]">
              From connect to optimized in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Connect",
                desc: "Deploy to clusters in minutes. Start in read-only mode. No infrastructure changes required.",
              },
              {
                step: "02",
                title: "Analyze",
                desc: "Observes real workload behavior, not static configs, to identify optimization opportunities.",
              },
              {
                step: "03",
                title: "Optimize",
                desc: "Automatically scales, rightsizes, and rebalances based on real-time signals, not cron jobs.",
              },
              {
                step: "04",
                title: "Fix",
                desc: "Use autonomous runbooks to fix operational and security issues. You approve every change.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-4 p-6 bg-surface-elevated border border-outline/10 rounded-xl relative overflow-hidden group hover:border-primary/30 transition-all"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 group-hover:bg-primary transition-colors" />
                <span className="font-[family-name:var(--font-mono)] text-[40px] opacity-15 font-black leading-none">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-on-surface font-[family-name:var(--font-title)]">
                  {item.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terminal Engine Logs Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl font-extrabold text-on-surface tracking-tight font-[family-name:var(--font-title)]">
              The performance engine for your cloud-native apps
            </h2>
            <p className="text-on-surface-variant leading-relaxed">
              Infrastructure that adapts to your code, not the other way around. Most automation relies on static rules. We use an advanced predictive model trained on millions of real-world workloads.
            </p>
            <div className="space-y-4">
              {[
                { num: "1", title: "App-aware reliability", desc: "Predict spot interruptions up to 30 minutes before they happen, migrating workloads gracefully." },
                { num: "2", title: "Precision rightsizing for stability", desc: "Adjusts CPU and memory at the millicore level to prevent resource starvation." },
                { num: "3", title: "Intelligent workload placement", desc: "Matches every pod to its optimal instance type, ensuring high-demand AI workloads run on optimal hardware." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {item.num}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-on-surface font-[family-name:var(--font-title)]">{item.title}</h4>
                    <p className="text-sm text-on-surface-variant mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-[#0b0c10] text-[#e3e2e7] rounded-2xl p-6 shadow-2xl border border-outline/10 space-y-4 font-[family-name:var(--font-mono)] text-xs">
              <div className="flex items-center gap-2 border-b border-outline/10 pb-3">
                <Terminal size={14} className="text-on-surface-variant/40" />
                <span className="text-on-surface-variant/50 font-bold tracking-widest uppercase text-[10px]">
                  OPTIMIZATION_LOGS_V2.0
                </span>
              </div>
              <div className="space-y-3 pt-2 text-[11px] leading-relaxed">
                <p className="text-sky-400">&gt; [ANALYSIS] Analyzing pod demand: core-api-v2-7749...</p>
                <p className="text-emerald-400">&gt; [RECOMMENDATION] Shift request from 580m to 312m (stable)</p>
                <p className="text-yellow-500">&gt; [ACTION] Executing zero-downtime node migration...</p>
                <p className="text-cyan-400">&gt; [RESULT] Memory pressure cleared. Node utilization: 92%</p>
                <p className="text-on-surface-variant/45">&gt; [IDLE] Monitoring active metrics. Potential: -$4,281/mo...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-on-surface font-[family-name:var(--font-title)]">
            Trusted by Leaders in Cloud-Native Engineering
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: '"KubeOptimize gets the perfect machine for the workload every time. Outstanding autonomy."',
              author: "Nicolas Hug",
              role: "Lead DevOps Engineer",
              initials: "NH",
            },
            {
              quote: '"For our workload, KubeOptimize was not just two times better or five times better. It was immeasurably better."',
              author: "Dekel Shavit",
              role: "VP of Product Engineering",
              initials: "DS",
            },
            {
              quote: '"What I like about this is that the product is so self-explanatory. We saw optimization on day one."',
              author: "Achi Solomon",
              role: "Director of DevOps",
              initials: "AS",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-surface-elevated border border-outline/10 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-6 hover:border-primary/20 transition-all"
            >
              <p className="text-sm text-on-surface-variant italic leading-relaxed">
                {item.quote}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm">
                  {item.initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface font-[family-name:var(--font-title)]">
                    {item.author}
                  </p>
                  <p className="text-[10px] text-on-surface-variant/70">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0669fd10,transparent_60%)] pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface max-w-xl mx-auto leading-tight font-[family-name:var(--font-title)]">
            Go from overprovisioned to fully optimized today.
          </h2>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto">
            Join thousands of developers automating their Kubernetes operations for peak stability and lowest cost.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-white bg-primary-container hover:opacity-90 rounded-lg shadow-lg shadow-primary-container/20 transition-all duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-on-surface bg-surface-elevated hover:bg-surface border border-outline/10 rounded-lg shadow-sm transition-all duration-200"
            >
              Book a Demo
            </Link>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="text-xs text-on-surface-variant/60 font-[family-name:var(--font-mono)] uppercase">
              ★ 4.8/5 rating based on 50+ enterprise reviews
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
