"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, HelpCircle, ChevronDown, ChevronUp, Layers, CheckCircle2, Minus } from "lucide-react";

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does the node-based pricing work?",
      a: "Our Growth tier is priced per active Kubernetes worker node per month. We do not bill for control plane nodes, or nodes running less than 15 cumulative hours in a month."
    },
    {
      q: "Can I use KubeOptimize on-premise?",
      a: "Yes, our Enterprise plan supports air-gapped and on-premise environments via our self-hosted operator and control plane deployment models."
    },
    {
      q: "Is there a read-only trial available?",
      a: "Yes! Connecting your cluster starts in Read-Only mode by default. You can see all cost forecasts, savings opportunities, and recommendations for free without making any changes."
    },
    {
      q: "What cluster sizes do you support?",
      a: "We support clusters from a single development node up to massive deployments of 5,000+ nodes across multiple regions."
    }
  ];

  return (
    <div className="space-y-20 pb-20 bg-background-custom text-on-surface transition-colors duration-200">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 text-center pt-12 md:pt-20 space-y-4">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary font-[family-name:var(--font-mono)]">
          Pricing & Plans
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-[family-name:var(--font-title)] text-on-surface">
          Scale efficiency, <span className="text-primary-container">not costs.</span>
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
          From solo developers to massive enterprises, KubeOptimize provides the automation needed to maintain technical dominance in the cloud.
        </p>
      </header>

      {/* Pricing Plans Grid */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Community Plan */}
        <div className="bg-surface-elevated border border-outline/10 p-8 rounded-2xl flex flex-col justify-between hover:border-outline/30 transition-all space-y-8">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-on-surface-variant/60 tracking-wider font-[family-name:var(--font-mono)] uppercase">Community</span>
              <h3 className="text-3xl font-bold font-[family-name:var(--font-title)] mt-2">Free</h3>
              <p className="text-xs text-on-surface-variant mt-1">For side projects and learning.</p>
            </div>
            <ul className="space-y-3.5 pt-6 border-t border-outline/10">
              <li className="flex items-center gap-2.5 text-sm text-on-surface-variant font-medium">
                <CheckCircle2 size={16} className="text-success-emerald shrink-0" />
                <span>Observability for 1 cluster</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-on-surface-variant/50 font-medium">
                <Minus size={16} className="text-on-surface-variant/20 shrink-0" />
                <span>Standard monitoring logs</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-on-surface-variant/50 font-medium">
                <Minus size={16} className="text-on-surface-variant/20 shrink-0" />
                <span>Community support</span>
              </li>
            </ul>
          </div>
          <Link
            href="/dashboard"
            className="w-full py-3 border border-outline/20 text-on-surface hover:bg-surface-container rounded-lg font-bold font-[family-name:var(--font-title)] text-center transition-all active:scale-[0.98] text-sm"
          >
            Start Free
          </Link>
        </div>

        {/* Growth Plan (Most Popular) */}
        <div className="bg-surface border-2 border-primary p-8 rounded-2xl flex flex-col justify-between relative shadow-xl space-y-8 scale-105 z-10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white font-[family-name:var(--font-mono)] text-[9px] font-bold px-3 py-1 rounded-full border border-primary/20 tracking-wider uppercase">
            Most Popular
          </div>
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-primary tracking-wider font-[family-name:var(--font-mono)] uppercase">Growth</span>
              <div className="flex items-baseline gap-1 mt-2">
                <h3 className="text-4xl font-extrabold font-[family-name:var(--font-title)] text-on-surface">$49</h3>
                <span className="text-xs text-on-surface-variant font-medium">/node/mo</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Advanced automation for scaling teams.</p>
            </div>
            <ul className="space-y-3.5 pt-6 border-t border-outline/10">
              <li className="flex items-center gap-2.5 text-sm text-on-surface font-medium">
                <CheckCircle2 size={16} className="text-success-emerald shrink-0" />
                <span>Unlimited Cluster Monitoring</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-on-surface font-medium">
                <CheckCircle2 size={16} className="text-success-emerald shrink-0" />
                <span>Standard Karpenter Optimization</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-on-surface font-medium">
                <CheckCircle2 size={16} className="text-success-emerald shrink-0" />
                <span>Basic GPU Sharing Logic</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-on-surface font-medium">
                <CheckCircle2 size={16} className="text-success-emerald shrink-0" />
                <span>Email Support (24h)</span>
              </li>
            </ul>
          </div>
          <Link
            href="/dashboard"
            className="w-full py-3 bg-primary-container text-white rounded-lg font-bold font-[family-name:var(--font-title)] text-center transition-all active:scale-[0.98] text-sm shadow-md shadow-primary-container/20"
          >
            Select Plan
          </Link>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-surface-elevated border border-outline/10 p-8 rounded-2xl flex flex-col justify-between hover:border-outline/30 transition-all space-y-8">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-on-surface-variant/60 tracking-wider font-[family-name:var(--font-mono)] uppercase">Enterprise</span>
              <h3 className="text-3xl font-bold font-[family-name:var(--font-title)] mt-2">Custom</h3>
              <p className="text-xs text-on-surface-variant mt-1">Agentic AI for massive infrastructure.</p>
            </div>
            <ul className="space-y-3.5 pt-6 border-t border-outline/10">
              <li className="flex items-center gap-2.5 text-sm text-on-surface-variant font-medium">
                <CheckCircle2 size={16} className="text-success-emerald shrink-0" />
                <span>Advanced AI Optimization</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-on-surface-variant font-medium">
                <CheckCircle2 size={16} className="text-success-emerald shrink-0" />
                <span>Agentic Runbooks</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-on-surface-variant font-medium">
                <CheckCircle2 size={16} className="text-success-emerald shrink-0" />
                <span>Multi-tenant Isolation</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-on-surface-variant font-medium">
                <CheckCircle2 size={16} className="text-success-emerald shrink-0" />
                <span>24/7 Dedicated Architect Support</span>
              </li>
            </ul>
          </div>
          <Link
            href="/dashboard"
            className="w-full py-3 border border-primary/45 text-primary hover:bg-primary/5 rounded-lg font-bold font-[family-name:var(--font-title)] text-center transition-all active:scale-[0.98] text-sm"
          >
            Contact Sales
          </Link>
        </div>

      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight font-[family-name:var(--font-title)]">Compare all capabilities</h2>
          <p className="text-sm text-on-surface-variant">Deep technical breakdown of every tier.</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-outline/10 bg-surface-elevated">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline/10 bg-surface-container-lowest/30">
                <th className="p-4 text-xs font-bold text-on-surface-variant/50 uppercase font-[family-name:var(--font-mono)]">Features</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant/50 uppercase font-[family-name:var(--font-mono)]">Community</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant/50 uppercase font-[family-name:var(--font-mono)] bg-surface-container/30">Growth</th>
                <th className="p-4 text-xs font-bold text-on-surface-variant/50 uppercase font-[family-name:var(--font-mono)]">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5 text-sm text-on-surface-variant">
              <tr className="hover:bg-surface-container/30 transition-colors">
                <td className="p-4 font-semibold text-on-surface font-[family-name:var(--font-title)]">Karpenter optimization</td>
                <td className="p-4 text-on-surface-variant/60">Manual only</td>
                <td className="p-4 font-medium text-on-surface bg-surface-container/10">Standard Automation</td>
                <td className="p-4 font-bold text-primary">Advanced Predictive</td>
              </tr>
              <tr className="hover:bg-surface-container/30 transition-colors">
                <td className="p-4 font-semibold text-on-surface font-[family-name:var(--font-title)]">GPU sharing</td>
                <td className="p-4 text-error"><X size={16} /></td>
                <td className="p-4 font-medium text-on-surface bg-surface-container/10">Static Bin-packing</td>
                <td className="p-4 font-bold text-primary">Dynamic Time-slicing</td>
              </tr>
              <tr className="hover:bg-surface-container/30 transition-colors">
                <td className="p-4 font-semibold text-on-surface font-[family-name:var(--font-title)]">Agentic runbooks</td>
                <td className="p-4 text-error"><X size={16} /></td>
                <td className="p-4 text-error bg-surface-container/10"><X size={16} /></td>
                <td className="p-4 font-bold text-primary">Full Autonomy</td>
              </tr>
              <tr className="hover:bg-surface-container/30 transition-colors">
                <td className="p-4 font-semibold text-on-surface font-[family-name:var(--font-title)]">Audit logs</td>
                <td className="p-4">7 days</td>
                <td className="p-4 bg-surface-container/10">90 days</td>
                <td className="p-4 font-bold text-primary">Unlimited / S3 Export</td>
              </tr>
              <tr className="hover:bg-surface-container/30 transition-colors">
                <td className="p-4 font-semibold text-on-surface font-[family-name:var(--font-title)]">Support SLA</td>
                <td className="p-4">None</td>
                <td className="p-4 bg-surface-container/10">Next business day</td>
                <td className="p-4 font-bold text-primary">1-hour response</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 space-y-8">
        <h3 className="text-2xl font-bold font-[family-name:var(--font-title)] text-center">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-outline/10 rounded-xl bg-surface-elevated overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 flex items-center justify-between text-left font-bold text-on-surface hover:bg-surface transition-colors font-[family-name:var(--font-title)]"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openFaq === idx && (
                <div className="p-5 border-t border-outline/10 bg-background-custom/30 text-sm text-on-surface-variant leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Reclaim Budget Block */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0669fd10,transparent_60%)] pointer-events-none" />
          <h2 className="text-3xl font-extrabold text-on-surface max-w-xl mx-auto leading-tight font-[family-name:var(--font-title)]">
            Ready to reclaim your cloud budget?
          </h2>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto">
            Join over 1,500 engineering teams who have automated their Kubernetes scaling and reduced costs by up to 45%.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 text-sm font-bold text-white bg-primary-container hover:opacity-90 rounded-lg shadow-lg shadow-primary-container/20 transition-all duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3.5 text-sm font-bold text-on-surface bg-surface-elevated hover:bg-surface border border-outline/10 rounded-lg shadow-sm transition-all duration-200"
            >
              Schedule Technical Demo
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
