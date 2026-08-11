"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, FileText, BarChart3, PieChart, Sparkles, Database, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchSystemStatus, loadDemoResearch } from "../lib/api";
import { SystemStatus } from "../lib/types";

interface SidebarProps {
  onDemoLoaded?: () => void;
}

export default function Sidebar({ onDemoLoaded }: SidebarProps) {
  const pathname = usePathname();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const loadStatus = async () => {
    try {
      const data = await fetchSystemStatus();
      setStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    try {
      await loadDemoResearch();
      await loadStatus();
      if (onDemoLoaded) onDemoLoaded();
    } catch (e) {
      alert("Failed to load demo data.");
    } finally {
      setLoadingDemo(false);
    }
  };

  const navItems = [
    { name: "Research Q&A", href: "/", icon: MessageSquare },
    { name: "Document Library", href: "/documents", icon: FileText },
    { name: "Insights Dashboard", href: "/insights", icon: PieChart },
    { name: "Product Analytics", href: "/analytics", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-[#0d121f] border-r border-[#232e42] flex flex-col justify-between h-screen sticky top-0 text-slate-200">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#232e42]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              IQ
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white">ProductIQ</h1>
              <p className="text-[10px] text-slate-400 font-medium leading-none">RAG Research Copilot</p>
            </div>
          </div>

          <div className="mt-3.5 px-2.5 py-1.5 rounded-md bg-[#161f30] border border-[#26334a] text-[11px] text-slate-300">
            <span className="text-slate-400 font-medium">Tagline: </span>
            <span className="italic">"Turn customer research into product decisions."</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#161f30]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Demo Loader & System Status */}
      <div className="p-4 border-t border-[#232e42] space-y-3 bg-[#0a0e17]">
        {/* Quick Demo Button */}
        <button
          onClick={handleLoadDemo}
          disabled={loadingDemo}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loadingDemo ? "Indexing Demo..." : "Load Demo Research"}</span>
        </button>

        {/* Mode Indicator Badge */}
        <div className="p-2.5 rounded-lg bg-[#131926] border border-[#232e42] text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>Embedding Mode:</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              status?.embedding_mode === "OpenAI"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            }`}>
              {status?.embedding_mode || "Local Demo"}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-[#1e293b]">
            <span className="flex items-center space-x-1">
              <Database className="w-3 h-3 text-slate-400" />
              <span>Vector Chunks:</span>
            </span>
            <span className="font-semibold text-slate-200">{status?.total_chunks_count || 0}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
