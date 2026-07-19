import MarketingHeader from "@/components/MarketingHeader";
import { Globe, Shield, Terminal, Layers } from "lucide-react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-custom text-on-surface flex flex-col font-[family-name:var(--font-body)] transition-colors duration-200">
      <MarketingHeader />
      <main className="flex-1 w-full relative">
        {/* Subtle grid background to match the screenshots */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        <div className="relative z-10 w-full">
          {children}
        </div>
      </main>

      {/* Large Corporate Footer exactly as shown in screenshot */}
      <footer className="bg-surface border-t border-outline/10 pt-16 pb-8 relative z-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Logo & Subtext */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-white shadow-sm">
                <Layers size={18} />
              </div>
              <span className="text-lg font-bold text-on-surface tracking-tight font-[family-name:var(--font-title)]">KubeOptimize</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">
              Leading AIOps platform enabling customers to cut cloud costs, improve performance, and boost productivity.
            </p>
            <div className="flex items-center gap-3 pt-2 text-on-surface-variant/70">
              <Globe size={18} className="hover:text-primary cursor-pointer transition-colors" />
              <Shield size={18} className="hover:text-primary cursor-pointer transition-colors" />
              <Terminal size={18} className="hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest font-[family-name:var(--font-title)]">Solutions</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">Workload Optimization</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cluster Optimization</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Karpenter Extensions</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">GPU Cost Monitoring</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest font-[family-name:var(--font-title)]">Resources</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Release Notes</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest font-[family-name:var(--font-title)]">Legal</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest font-[family-name:var(--font-title)]">Contact</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">Support Portal</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Sales Inquiry</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="max-w-7xl mx-auto px-6 border-t border-outline/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-on-surface-variant/50 font-medium">
          <p>© {new Date().getFullYear()} KubeOptimize Inc. All rights reserved.</p>
          <p>Designed with AI for Cloud-Native Infrastructure</p>
        </div>
      </footer>
    </div>
  );
}
