"use client";

import { AlertOctagon, TrendingUp, Users, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { PainPointInsight, FeatureRequestInsight } from "../lib/types";

interface PainPointCardProps {
  painPoint: PainPointInsight;
}

export function PainPointCard({ painPoint }: PainPointCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-[#0f0f11] border border-zinc-800 hover:border-yellow-500/40 transition-all shadow-lg space-y-3">
      <div className="flex items-start justify-between">
        <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-500/40">
          Impact: {painPoint.impact_level}
        </span>
        <span className="text-xs font-semibold text-zinc-400 font-mono">
          {painPoint.observed_mentions} Observed Mentions
        </span>
      </div>

      <div>
        <h4 className="font-semibold text-sm text-white">{painPoint.category}</h4>
        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{painPoint.description}</p>
      </div>

      {/* Quotes */}
      {painPoint.sample_quotes && painPoint.sample_quotes.length > 0 && (
        <div className="p-3 rounded-xl bg-[#050505] border border-zinc-800 text-xs text-zinc-300 space-y-1 italic">
          <span className="text-[10px] text-yellow-400 not-italic uppercase font-bold block">Supporting Quote:</span>
          <p>"{painPoint.sample_quotes[0]}"</p>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
        <span className="flex items-center space-x-1">
          <FileText className="w-3 h-3 text-yellow-400" />
          <span>{painPoint.supporting_documents.length} Source Docs</span>
        </span>
        <span className="text-emerald-400 font-bold">
          {(painPoint.confidence_score * 100).toFixed(0)}% Evidence Confidence
        </span>
      </div>
    </div>
  );
}

interface FeatureRequestCardProps {
  feature: FeatureRequestInsight;
}

export function FeatureRequestCard({ feature }: FeatureRequestCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-[#0f0f11] border border-zinc-800 hover:border-yellow-500/40 transition-all shadow-lg space-y-3">
      <div className="flex items-start justify-between">
        <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-500/40">
          Evidence: {feature.evidence_strength}
        </span>
        <span className="text-xs font-semibold text-zinc-400 font-mono">
          {feature.observed_mentions} Requests
        </span>
      </div>

      <div>
        <h4 className="font-semibold text-sm text-white">{feature.feature_name}</h4>
        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{feature.description}</p>
      </div>

      <div className="flex items-center space-x-2 pt-1">
        <span className="text-[10px] text-zinc-400 font-medium">Segments:</span>
        <div className="flex flex-wrap gap-1">
          {feature.requesting_segments.map((seg, i) => (
            <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-yellow-300 text-[10px] font-mono border border-zinc-700">
              {seg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
