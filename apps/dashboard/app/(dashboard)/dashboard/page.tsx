"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";
import {
  Server,
  ArrowUpRight,
  CheckCircle,
  Brain,
  DollarSign,
  Cpu,
  Wifi,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  X,
  Sparkles,
  Info,
  Terminal,
  Activity,
  Layers,
  Settings,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const [showSlackBanner, setShowSlackBanner] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [activeOS, setActiveOS] = useState<"mac" | "linux" | "win">("linux");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [simRunning, setSimRunning] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simComplete, setSimComplete] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const [clusters, setClusters] = useState<any[]>([]);
  const [costs, setCosts] = useState({ mtd_spend: 49600.0, mtd_savings: 18400.0 });
  const [loading, setLoading] = useState(true);

  // Features check state for connection modal
  const [features, setFeatures] = useState({
    monitoring: true,
    reliability: false,
    optimization: true,
    autoscaler: true,
  });

  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        const clusterRes = await fetch("/api/v1/clusters");
        if (clusterRes.ok) {
          const data = await clusterRes.json();
          setClusters(data);
        } else {
          throw new Error("fail");
        }
      } catch (err) {
        setClusters([
          { id: "demo-cluster", name: "demo-cluster", provider: "aws", region: "ap-south-1", nodes: 1, status: "connected" }
        ]);
      }

      try {
        const costRes = await fetch("/api/v1/costs/current");
        if (costRes.ok) {
          const data = await costRes.json();
          setCosts(data);
        }
      } catch (err) {
        // use default state costs
      }
      setLoading(false);
    };

    fetchRealTimeData();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const startSimulation = () => {
    setSimRunning(true);
    setSimComplete(false);
    setSimProgress(0);
    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSimRunning(false);
          setSimComplete(true);
          setShowTooltip(false);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const cliInstallCmds = {
    mac: "brew install kubeoptima/tap/kubeoptima-cli",
    linux: "curl -s https://get.kubeoptima.ai/install.sh | bash",
    win: "powershell -Command \"iwr -useb https://get.kubeoptima.ai/install.ps1 | iex\"",
  };

  const connectCmd = `kubeoptima-cli cluster connect --api-token="ko_v1_bd875bd5ec30ea421e2308808f2929b5bfcfe11636908789926f1ee0b1a5216f_268f99d6" --region="ap-south-1" --features="${
    Object.entries(features)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name)
      .join(",")
  }"`;

  return (
    <div className="py-4 max-w-7xl mx-auto space-y-8 text-text-main transition-colors duration-200">
      
      {/* 1. Slack Announcement Banner */}
      <AnimatePresence>
        {showSlackBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="relative flex items-start gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-lg overflow-hidden"
          >
            <div className="w-10 h-10 rounded-lg bg-[#E01E5A]/10 border border-[#E01E5A]/20 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#E01E5A]">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.824a2.528 2.528 0 0 1-2.52-2.52v-5.042zM8.824 5.043a2.528 2.528 0 0 1-2.52-2.52A2.528 2.528 0 0 1 8.824 0a2.528 2.528 0 0 1 2.522 2.522v2.52h-2.522zm0 1.261a2.528 2.528 0 0 1 2.522 2.52v5.043a2.528 2.528 0 0 1-2.522 2.52H3.782a2.528 2.528 0 0 1-2.522-2.52V8.824a2.528 2.528 0 0 1 2.522-2.52h5.042zm10.134 3.761a2.528 2.528 0 0 1 2.52-2.522 2.528 2.528 0 0 1 2.522 2.522 2.528 2.528 0 0 1-2.522 2.52h-2.52v-2.52zm-1.262 0a2.528 2.528 0 0 1-2.52 2.52h-5.043a2.528 2.528 0 0 1-2.522-2.52V3.782a2.528 2.528 0 0 1 2.522-2.522h5.043a2.528 2.528 0 0 1 2.52 2.522v5.042zM15.176 18.958a2.528 2.528 0 0 1 2.52 2.522 2.528 2.528 0 0 1-2.52 2.52 2.528 2.528 0 0 1-2.522-2.52v-2.522h2.522zm0-1.262a2.528 2.528 0 0 1-2.522-2.52v-5.043a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.043a2.528 2.528 0 0 1-2.522 2.52h-5.043z"/>
              </svg>
            </div>
            <div className="flex-1 pr-6">
              <h4 className="text-sm font-bold text-white">Get KubeOptima alerts in Slack</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Get notified about cluster cost events, rightsizing recommendations, and spot interruptions directly where your team already works. Connect your workspace in a few clicks.
              </p>
              <a
                href="/settings"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-2.5 group"
              >
                Get started <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
            <button
              onClick={() => setShowSlackBanner(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Hero Action Section */}
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-main">Automation</h1>
          <h2 className="text-xl font-bold text-text-main/90 mt-2">Reduce your Kubernetes costs automatically</h2>
          <p className="text-sm text-text-sub max-w-3xl mt-2 leading-relaxed">
            KubeOptima analyzes your cloud infrastructure and continuously eliminates waste through automated workload rightsizing and node autoscaling. Stop overpaying for unused capacity and start saving within hours of connecting your account.
          </p>
        </div>
        <div className="flex items-center gap-5 pt-1">
          <button
            onClick={() => setShowConnectModal(true)}
            className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Connect cluster
          </button>
          <button
            onClick={() => startSimulation()}
            className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            Discover clusters
          </button>
        </div>
      </div>

      {/* 3. Cluster Explorer Table */}
      <div className="space-y-5 relative pt-4">
        <div>
          <h3 className="text-lg font-bold text-text-main">Or explore optimization simulation</h3>
          <p className="text-xs text-text-sub mt-1">{clusters.length} active cluster{clusters.length !== 1 && 's'} connected</p>
        </div>

        <div className="rounded-xl border border-border-custom bg-surface overflow-hidden shadow-card relative">
          
          <table className="w-full text-left border-collapse">
            <thead>
              {/* Extra row for EFFICIENCY header span */}
              <tr className="border-b border-border-custom/30 text-[9px] font-bold text-slate-400 bg-slate-500/[0.01]">
                <th colSpan={4}></th>
                <th colSpan={2} className="text-center py-1.5 border-x border-border-custom/30 text-[9px] uppercase tracking-wider font-semibold text-indigo-600">
                  Efficiency
                </th>
                <th colSpan={4}></th>
              </tr>
              <tr className="border-b border-border-custom/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-500/[0.02]">
                <th className="py-3 px-5 w-12 text-center">ID</th>
                <th className="py-3 px-5">Name</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Score</th>
                <th className="py-3 px-5 border-l border-border-custom/30">CPU</th>
                <th className="py-3 px-5 border-r border-border-custom/30">Memory</th>
                <th className="py-3 px-5">Automation</th>
                <th className="py-3 px-5">Issues</th>
                <th className="py-3 px-5 text-right">Save</th>
                <th className="py-3 px-5 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom/30 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-text-sub">Loading cluster metrics...</td>
                </tr>
              ) : (
                clusters.map((cluster, index) => (
                  <tr key={cluster.id} className="hover:bg-slate-500/[0.01] transition-colors">
                    <td className="py-4 px-5 text-center text-slate-450 font-mono">
                      <span className="cursor-pointer inline-block" onClick={() => handleCopy(cluster.id, `cluster-id-${index}`)}>
                        {copiedText === `cluster-id-${index}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-indigo-600 cursor-pointer hover:underline">{cluster.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">{cluster.provider || 'aws'} · {cluster.region || 'ap-south-1'} · {cluster.nodes} node{cluster.nodes !== 1 && 's'}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-500 border border-sky-500/20">
                        {cluster.status}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                        1.2
                      </span>
                    </td>
                    <td className="py-4 px-5 border-l border-border-custom/30">
                      <div className="font-bold text-text-main">{simComplete ? "92.4%" : "59.49%"}</div>
                      <div className="text-[10px] text-slate-450 font-mono mt-1">34.5 / 58 CPU</div>
                    </td>
                    <td className="py-4 px-5 border-r border-border-custom/30">
                      <div className="font-bold text-text-main">{simComplete ? "88.6%" : "28.57%"}</div>
                      <div className="text-[10px] text-slate-455 font-mono mt-1">95.2 / 333 Gi</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-550 border border-border-custom">
                        ENABLED 0/2
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-red-500">
                      {simComplete ? "0" : "11"}
                    </td>
                    <td className="py-4 px-5 text-right font-bold text-emerald-500">
                      <div className="flex items-center justify-end gap-1">
                        <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{simComplete ? "$0.00" : `$${costs.mtd_savings.toLocaleString()}`}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center relative">
                      <button
                        onClick={() => startSimulation()}
                        disabled={simRunning}
                        className={clsx(
                          "px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer shadow-sm",
                          simRunning ? "bg-indigo-600/40" :
                          simComplete ? "bg-emerald-600 hover:bg-emerald-500" : "bg-indigo-650 hover:bg-indigo-600"
                        )}
                      >
                        {simRunning ? `Running (${simProgress}%)` : simComplete ? "Optimized" : "Run simulation"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* 3.1 Custom CAST AI Tooltip Card */}
          <AnimatePresence>
            {showTooltip && !simRunning && !simComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-4 bottom-[-165px] z-20 w-80 bg-indigo-950 text-white rounded-xl shadow-2xl p-5 border border-indigo-800 flex flex-col gap-3.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white">Experience KubeOptima's Impact</h4>
                    <button onClick={() => setShowTooltip(false)} className="text-indigo-400 hover:text-indigo-200">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-indigo-200 mt-1.5 leading-relaxed">
                    Run a realistic simulation to watch KubeOptima reduce waste, improve efficiency, and lower costs.
                  </p>
                </div>
                
                {/* Mini Area Chart SVG */}
                <div className="space-y-1.5">
                  <div className="text-[8px] font-bold text-indigo-300 uppercase tracking-widest">Cluster CPU Utilization</div>
                  <div className="h-16 w-full relative bg-indigo-900/40 rounded-lg overflow-hidden border border-indigo-900/60 flex items-end">
                    <svg className="w-full h-12 text-indigo-500 fill-current opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M0,80 Q10,40 25,60 T50,30 T75,70 T100,20 L100,100 L0,100 Z" />
                    </svg>
                    <svg className="w-full h-12 text-indigo-400 stroke-current absolute left-0 bottom-0" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" strokeWidth="2">
                      <path d="M0,80 Q10,40 25,60 T50,30 T75,70 T100,20" />
                    </svg>
                    <div className="absolute top-1.5 left-2.5 text-[8px] text-indigo-400 font-mono">480m</div>
                    <div className="absolute bottom-1.5 left-2.5 text-[8px] text-indigo-400 font-mono">0</div>
                  </div>
                </div>
                
                {/* Small indicator arrow */}
                <div className="absolute top-[-6px] right-20 w-3 h-3 bg-indigo-950 border-t border-l border-indigo-800 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* 4. Connected Cluster Modal (Popup Overlay) */}
      <AnimatePresence>
        {showConnectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-surface border border-border-custom rounded-xl shadow-2xl overflow-hidden flex flex-col h-[520px]"
            >
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom bg-slate-500/[0.02]">
                <h2 className="text-base font-black text-text-main">Connect your Kubernetes cluster</h2>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="text-slate-400 hover:text-text-main cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 flex min-h-0">
                
                {/* Left column - Choose features */}
                <div className="w-1/2 p-6 border-r border-border-custom overflow-y-auto space-y-5">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Choose features</h3>
                    <p className="text-[11px] text-text-sub mt-0.5">Configure feature toggles. You can change these options anytime later.</p>
                  </div>

                  <div className="space-y-3">
                    
                    {/* Cost Monitoring */}
                    <label className="flex items-start gap-3 p-3 rounded-lg border border-border-custom bg-slate-500/[0.01] hover:bg-slate-500/[0.02] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={features.monitoring}
                        disabled
                        className="mt-1 accent-indigo-650"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-main">Cost monitoring</span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-500 uppercase">Read only</span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-500/10 text-slate-500 uppercase">Free</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Track and analyze your Kubernetes spending with detailed cost breakdowns.</p>
                      </div>
                    </label>

                    {/* Reliability Metrics */}
                    <label className="flex items-start gap-3 p-3 rounded-lg border border-border-custom hover:bg-slate-500/[0.02] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={features.reliability}
                        onChange={(e) => setFeatures({ ...features, reliability: e.target.checked })}
                        className="mt-1 accent-indigo-650"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-main">Reliability metrics</span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-sky-500/10 text-sky-500 uppercase">Early access</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Collect metrics for availability, latency, error rates, and CPU throttles.</p>
                      </div>
                    </label>

                    {/* Cluster Optimization */}
                    <label className="flex items-start gap-3 p-3 rounded-lg border border-border-custom hover:bg-slate-500/[0.02] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={features.optimization}
                        onChange={(e) => setFeatures({ ...features, optimization: e.target.checked })}
                        className="mt-1 accent-indigo-650"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-main">Cluster optimization</span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-indigo-500/10 text-indigo-500 uppercase">Premium</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Optimize cluster performance and node sizing using AI recommendations.</p>
                      </div>
                    </label>

                    {/* Workload Autoscaler */}
                    <label className="flex items-start gap-3 p-3 rounded-lg border border-border-custom hover:bg-slate-500/[0.02] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={features.autoscaler}
                        onChange={(e) => setFeatures({ ...features, autoscaler: e.target.checked })}
                        className="mt-1 accent-indigo-650"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-main">Workload autoscaler</span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-indigo-500/10 text-indigo-500 uppercase">Premium</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Enable horizontal pod autoscaling and automated replica scale actions.</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Right column - Run in terminal */}
                <div className="w-1/2 p-6 overflow-y-auto space-y-5 bg-slate-500/[0.01]">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Run in your terminal</h3>
                    <p className="text-[11px] text-text-sub mt-0.5">Your selected features are pre-configured in the commands below.</p>
                  </div>

                  {/* Step 1: Install CLI */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-indigo-600/10 text-indigo-600 flex items-center justify-center text-[10px] font-black">1</span>
                        Install kubeoptima-cli
                      </span>
                      <div className="flex items-center border border-border-custom rounded-lg overflow-hidden text-[9px] font-bold">
                        <button
                          onClick={() => setActiveOS("mac")}
                          className={clsx("px-2 py-1 cursor-pointer", activeOS === "mac" ? "bg-indigo-600 text-white" : "bg-surface text-text-sub")}
                        >
                          macOS
                        </button>
                        <button
                          onClick={() => setActiveOS("linux")}
                          className={clsx("px-2 py-1 border-x border-border-custom cursor-pointer", activeOS === "linux" ? "bg-indigo-600 text-white" : "bg-surface text-text-sub")}
                        >
                          Linux
                        </button>
                        <button
                          onClick={() => setActiveOS("win")}
                          className={clsx("px-2 py-1 cursor-pointer", activeOS === "win" ? "bg-indigo-600 text-white" : "bg-surface text-text-sub")}
                        >
                          Windows
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <pre className="p-3 bg-slate-950 text-slate-300 font-mono text-[10px] rounded-lg overflow-x-auto pr-10 border border-slate-900 leading-normal">
                        {cliInstallCmds[activeOS]}
                      </pre>
                      <button
                        onClick={() => handleCopy(cliInstallCmds[activeOS], "install-cmd")}
                        className="absolute right-2 top-2 p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {copiedText === "install-cmd" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Connect Cluster */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-600/10 text-indigo-600 flex items-center justify-center text-[10px] font-black">2</span>
                      Connect your cluster
                    </span>
                    <p className="text-[10px] text-slate-400">Run this command from your terminal where `kubectl` is pointed to your cluster.</p>
                    
                    <div className="relative">
                      <pre className="p-3 bg-slate-950 text-slate-300 font-mono text-[10px] rounded-lg overflow-x-auto pr-10 border border-slate-900 whitespace-pre-wrap leading-relaxed">
                        {connectCmd}
                      </pre>
                      <button
                        onClick={() => handleCopy(connectCmd, "connect-cmd")}
                        className="absolute right-2 top-2 p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {copiedText === "connect-cmd" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border-custom bg-slate-500/[0.02] flex items-center justify-between">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  KubeOptima-cli is the recommended connection method.
                </span>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
