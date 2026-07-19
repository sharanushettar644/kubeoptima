import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KubeOptima AI — Kubernetes Cost Optimization Platform",
  description:
    "Enterprise AI-powered Kubernetes cost optimization. Reduce cloud spend by 40–70% with autonomous AI optimization, predictive autoscaling, and intelligent rightsizing.",
  keywords: [
    "kubernetes",
    "cost optimization",
    "AI",
    "cloud cost",
    "k8s",
    "autoscaling",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch (_) {}
        `}} />
      </head>
      <body className="min-h-screen transition-colors duration-200 bg-background-custom text-on-surface">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] dark:block hidden" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] dark:block hidden" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/3 rounded-full blur-[150px] dark:block hidden" />
        </div>

        {/* Sub-layout injected here */}
        {children}
      </body>
    </html>
  );
}


