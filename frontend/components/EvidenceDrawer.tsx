"use client";

import { X, FileText, CheckCircle2, Search, ExternalLink } from "lucide-react";
import { Citation } from "../lib/types";

interface EvidenceDrawerProps {
  citation: Citation | null;
  onClose: () => void;
}

export default function EvidenceDrawer({ citation, onClose }: EvidenceDrawerProps) {
  if (!citation) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-[#111726] border-l border-[#232e42] shadow-2xl z-50 flex flex-col justify-between text-slate-200 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#232e42] flex items-center justify-between bg-[#0e1320]">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Source Evidence Inspector</h3>
            <p className="text-[11px] text-slate-400">Citation [{citation.citation_id}]</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f293d] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Metadata Cards */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-[#182133] border border-[#26334a]">
            <span className="text-slate-400 text-[10px] block">Document File</span>
            <span className="font-medium text-slate-200 truncate block">{citation.filename}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#182133] border border-[#26334a]">
            <span className="text-slate-400 text-[10px] block">Page Number</span>
            <span className="font-medium text-slate-200 block">
              {citation.page_number ? `Page ${citation.page_number}` : "N/A (Full Doc)"}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#182133] border border-[#26334a]">
            <span className="text-slate-400 text-[10px] block">Chunk ID</span>
            <span className="font-mono text-[10px] text-blue-300 truncate block">{citation.chunk_id}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#182133] border border-[#26334a]">
            <span className="text-slate-400 text-[10px] block">Vector Relevance Score</span>
            <span className="font-semibold text-emerald-400 block">
              {(citation.similarity_score * 100).toFixed(1)}% Match
            </span>
          </div>
        </div>

        {/* Source Text Passage */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span>Retrieved Vector Text Chunk</span>
          </label>
          <div className="p-3.5 rounded-xl bg-[#090d14] border border-[#1e293b] text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap select-text">
            {citation.text}
          </div>
        </div>

        {/* Trust & Provenance Notice */}
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            This evidence passage was retrieved directly from local ChromaDB vector storage without modification.
          </span>
        </div>
      </div>

      {/* Footer Close */}
      <div className="p-4 border-t border-[#232e42] bg-[#0e1320]">
        <button
          onClick={onClose}
          className="w-full py-2 rounded-lg bg-[#1e293b] hover:bg-[#28354d] text-slate-200 text-xs font-medium transition-colors"
        >
          Close Evidence Panel
        </button>
      </div>
    </div>
  );
}
