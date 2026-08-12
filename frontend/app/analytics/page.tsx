"use client";

import { useEffect, useState } from "react";
import { fetchAnalytics } from "../../lib/api";
import { AnalyticsSummary } from "../../lib/types";
import LoadingState from "../../components/LoadingState";
import { BarChart3, HelpCircle, FileText, MousePointer, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAnalytics();
        setAnalytics(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingState message="Loading product usage analytics..." />;
  if (!analytics) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-yellow-400" />
          <span>Product Usage Analytics</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Local telemetry tracking questions asked, evidence verification CTR, and retrieval precision.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f0f11] border border-zinc-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Questions Asked</span>
            <HelpCircle className="w-4 h-4 text-yellow-400" />
          </div>
          <span className="text-3xl font-extrabold text-white block">{analytics.questions_asked}</span>
          <span className="text-[10px] text-zinc-400 block">Total Q&A invocations</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f0f11] border border-zinc-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Documents Processed</span>
            <FileText className="w-4 h-4 text-yellow-400" />
          </div>
          <span className="text-3xl font-extrabold text-white block">{analytics.documents_processed}</span>
          <span className="text-[10px] text-zinc-400 block">Ingested research files</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f0f11] border border-zinc-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Citation CTR</span>
            <MousePointer className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-extrabold text-emerald-400 block">{analytics.citation_click_through_rate_pct}%</span>
          <span className="text-[10px] text-zinc-400 block">{analytics.citation_clicks} citation clicks</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f0f11] border border-zinc-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Avg Retrieval Score</span>
            <Activity className="w-4 h-4 text-yellow-400" />
          </div>
          <span className="text-3xl font-extrabold text-yellow-400 block">{(analytics.average_retrieval_score * 100).toFixed(1)}%</span>
          <span className="text-[10px] text-zinc-400 block">Cosine vector match</span>
        </div>
      </div>
    </div>
  );
}
