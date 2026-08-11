"use client";

import { AlertOctagon, TrendingUp, Users, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { PainPointInsight, FeatureRequestInsight } from "../lib/types";

interface PainPointCardProps {
  painPoint: PainPointInsight;
}

export function PainPointCard({ painPoint }: PainPointCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-[#131926] border border-[#232e42] hover:border-blue-500/30 transition-all shadow-lg space-y-3">
      <div className="flex items-start justify-between">
        <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Impact: {painPoint.impact_level}
        </span>
        <span className="text-xs font-semibold text-slate-400 font-mono">
          {painPoint.observed_mentions} Observed Mentions
        </span>
      </div>

      <div>
        <h4 className="font-semibold text-sm text-white">{painPoint.category}</h4>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{painPoint.description}</p>
      </div>

      {/* Quotes */}
      {painPoint.sample_quotes && painPoint.sample_quotes.length > 0 && (
        <div className="p-3 rounded-xl bg-[#090d14] border border-[#1e293b] text-xs text-slate-300 space-y-1 italic">
          <span className="text-[10px] text-slate-500 not-italic uppercase font-bold block">Supporting Quote:</span>
          <p>"{painPoint.sample_quotes[0]}"</p>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#1e293b]">
        <span className="flex items-center space-x-1">
          <FileText className="w-3 h-3 text-blue-400" />
          <span>{painPoint.supporting_documents.length} Source Docs</span>
        </span>
        <span className="text-emerald-400 font-semibold">
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
    <div className="p-5 rounded-2xl bg-[#131926] border border-[#232e42] hover:border-blue-500/30 transition-all shadow-lg space-y-3">
      <div className="flex items-start justify-between">
        <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          Evidence: {feature.evidence_strength}
        </span>
        <span className="text-xs font-semibold text-slate-400 font-mono">
          {feature.observed_mentions} Requests
        </span>
      </div>

      <div>
        <h4 className="font-semibold text-sm text-white">{feature.feature_name}</h4>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{feature.description}</p>
      </div>

      <div className="flex items-center space-x-2 pt-1">
        <span className="text-[10px] text-slate-400 font-medium">Segments:</span>
        <div className="flex flex-wrap gap-1">
          {feature.requesting_segments.map((seg, i) => (
            <span key={i} className="px-2 py-0.5 rounded bg-[#1e293b] text-slate-300 text-[10px] font-mono">
              {seg}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
