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
    <aside className="w-64 bg-[#09090b] border-r border-zinc-800 flex flex-col justify-between h-screen sticky top-0 text-zinc-200">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center font-black text-black shadow-lg shadow-yellow-400/20">
              IQ
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white">Product<span className="text-yellow-400">IQ</span></h1>
              <p className="text-[10px] text-zinc-400 font-medium leading-none">RAG Research Copilot</p>
            </div>
          </div>

          <div className="mt-3.5 px-2.5 py-1.5 rounded-md bg-[#121215] border border-zinc-800 text-[11px] text-zinc-300">
            <span className="text-zinc-400 font-medium">Tagline: </span>
            <span className="italic text-yellow-300/90">"Turn customer research into product decisions."</span>
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
                    ? "bg-yellow-400/15 text-yellow-400 border border-yellow-500/30 font-semibold"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-[#121215]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-yellow-400" : "text-zinc-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Demo Loader & System Status */}
      <div className="p-4 border-t border-zinc-800 space-y-3 bg-[#050505]">
        {/* Quick Demo Button */}
        <button
          onClick={handleLoadDemo}
          disabled={loadingDemo}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold shadow-md shadow-yellow-400/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loadingDemo ? "Indexing Demo..." : "Load Demo Research"}</span>
        </button>

        {/* Mode Indicator Badge */}
        <div className="p-2.5 rounded-lg bg-[#121215] border border-zinc-800 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-zinc-300 font-medium">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-3 h-3 text-yellow-400" />
              <span>Embedding Mode:</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              status?.embedding_mode === "OpenAI"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-yellow-400/20 text-yellow-300 border border-yellow-500/40"
            }`}>
              {status?.embedding_mode || "Local Demo"}
            </span>
          </div>

          <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-zinc-800">
            <span className="flex items-center space-x-1">
              <Database className="w-3 h-3 text-zinc-400" />
              <span>Vector Chunks:</span>
            </span>
            <span className="font-bold text-yellow-400">{status?.total_chunks_count || 0}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
