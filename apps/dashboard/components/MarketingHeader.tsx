"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Layers, Sun, Moon } from "lucide-react";

export default function MarketingHeader() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark") || 
                   localStorage.theme === "dark" || 
                   (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navItems = [
    { name: "Platform", href: "/" },
    { name: "Solutions", href: "/solutions" },
    { name: "Resources", href: "/resources" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline/10 bg-surface/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Layers size={18} />
          </div>
          <span className="text-xl font-bold text-on-surface tracking-tight font-[family-name:var(--font-title)] group-hover:text-primary transition-colors duration-200">
            KubeOptimize
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-200 py-1.5 relative ${
                  isActive
                    ? "text-primary font-bold border-b-2 border-primary pb-1"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* CTAs & Theme Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "light" ? <Moon size={18} /> : <Sun size={18} />
            ) : (
              <div className="w-[18px] h-[18px]" />
            )}
          </button>

          <Link
            href="/dashboard"
            className="text-sm font-medium text-on-surface hover:text-primary transition-all duration-200"
          >
            Login
          </Link>
          
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-container hover:opacity-90 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-[1px]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
