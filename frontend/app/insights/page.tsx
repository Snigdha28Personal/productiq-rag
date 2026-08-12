"use client";

import { useEffect, useState } from "react";
import { fetchInsights } from "../../lib/api";
import { InsightSummary } from "../../lib/types";
import { PainPointCard, FeatureRequestCard } from "../../components/InsightCard";
import LoadingState from "../../components/LoadingState";
import { PieChart, Users, AlertCircle, Info, Sparkles } from "lucide-react";

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchInsights();
        setInsights(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingState message="Extracting product research insights across corpus..." />;
  if (!insights) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <PieChart className="w-6 h-6 text-yellow-400" />
          <span>Product Insights Dashboard</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Synthesized patterns, recurring pain points, customer segment themes, and feature opportunities.
        </p>
      </div>

      {/* Dataset Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f0f11] border border-zinc-800 shadow-md">
          <span className="text-[11px] text-zinc-400 font-medium block">Analyzed Documents</span>
          <span className="text-2xl font-bold text-white mt-1 block">{insights.total_documents_analyzed} Files</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0f0f11] border border-zinc-800 shadow-md">
          <span className="text-[11px] text-zinc-400 font-medium block">Research Chunks Indexed</span>
          <span className="text-2xl font-bold text-yellow-400 mt-1 block">{insights.total_chunks_processed} Chunks</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#0f0f11] border border-zinc-800 shadow-md">
          <span className="text-[11px] text-zinc-400 font-medium block">Identified Themes</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">
            {insights.top_pain_points.length + insights.feature_requests.length} Insights
          </span>
        </div>
      </div>

      {/* Methodological Disclaimer */}
      <div className="p-3.5 rounded-xl bg-yellow-400/10 border border-yellow-500/20 text-yellow-300 text-xs flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{insights.disclaimer}</p>
      </div>

      {/* Top Pain Points Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <span>Top Customer Pain Points</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.top_pain_points.map((pp, i) => (
            <PainPointCard key={i} painPoint={pp} />
          ))}
        </div>
      </div>

      {/* Customer Segments Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Users className="w-5 h-5 text-yellow-400" />
          <span>Customer Segment Analysis</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.customer_segments.map((seg, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#0f0f11] border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="font-bold text-sm text-white">{seg.segment} Segment</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 font-mono border border-yellow-500/30">
                  {seg.sample_documents.length} Docs
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Top Priorities & Concerns:</span>
                <ul className="space-y-1 text-xs text-zinc-300">
                  {seg.top_concerns.map((tc, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <span className="text-yellow-400 font-bold">•</span>
                      <span>{tc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Requests Matrix */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span>High-Impact Feature Requests</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.feature_requests.map((fr, i) => (
            <FeatureRequestCard key={i} feature={fr} />
          ))}
        </div>
      </div>
    </div>
  );
}
