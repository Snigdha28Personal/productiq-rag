"use client";

import { useState } from "react";
import { 
  Sparkles, User, AlertTriangle, FileText, ChevronDown, 
  ChevronUp, ShieldCheck, Terminal, HelpCircle 
} from "lucide-react";
import { RAGResponse, Citation } from "../lib/types";
import CitationChip from "./CitationChip";

interface ChatMessageProps {
  role: "user" | "assistant";
  content?: string;
  ragResponse?: RAGResponse;
  onCitationClick: (citation: Citation) => void;
}

export default function ChatMessage({ role, content, ragResponse, onCitationClick }: ChatMessageProps) {
  const [showDebug, setShowDebug] = useState(false);

  if (role === "user") {
    return (
      <div className="flex items-start space-x-3 justify-end my-4">
        <div className="max-w-2xl px-4 py-3 rounded-2xl bg-yellow-400 text-black font-semibold text-sm shadow-md">
          {content}
        </div>
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 shrink-0">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  if (!ragResponse) return null;

  const { key_finding, evidence, interpretation, citations, is_insufficient_evidence, debug_info } = ragResponse;

  return (
    <div className="flex items-start space-x-3 my-6 text-zinc-100">
      <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-bold shrink-0 shadow-md">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex-1 max-w-3xl space-y-4">
        {/* Insufficient Evidence Guardrail Warning */}
        {is_insufficient_evidence ? (
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 space-y-2">
            <div className="flex items-center space-x-2 font-semibold text-sm text-yellow-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Grounding Guardrail Enforced</span>
            </div>
            <p className="text-sm leading-relaxed">{key_finding}</p>
            <p className="text-xs text-yellow-300/80 italic">{interpretation}</p>
          </div>
        ) : (
          <div className="bg-[#0f0f11] border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            {/* Key Finding */}
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-yellow-400">Key Finding</span>
              <p className="text-sm font-medium text-zinc-100 leading-relaxed">{key_finding}</p>
            </div>

            {/* Evidence Bullets */}
            {evidence && evidence.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">Evidence</span>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {evidence.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-yellow-400 font-bold">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interpretation */}
            {interpretation && (
              <div className="space-y-1 pt-2 border-t border-zinc-800/80">
                <span className="text-[11px] uppercase tracking-wider font-bold text-yellow-300">Interpretation</span>
                <p className="text-xs text-zinc-300 leading-relaxed italic">{interpretation}</p>
              </div>
            )}

            {/* Sources List */}
            {citations && citations.length > 0 && (
              <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Grounding Sources ({citations.length})</span>
                </span>

                <div className="flex flex-wrap gap-2 pt-1">
                  {citations.map((c) => (
                    <button
                      key={c.citation_id}
                      onClick={() => onCitationClick(c)}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] border border-zinc-700 text-xs transition-colors"
                    >
                      <CitationChip citation={c} onClick={onCitationClick} />
                      <span className="text-zinc-200 font-medium">{c.filename}</span>
                      {c.page_number && <span className="text-zinc-400 text-[10px]">p.{c.page_number}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RAG Transparency & Debug Details Toggle */}
        {debug_info && (
          <div className="pt-1">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center space-x-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors font-mono"
            >
              <Terminal className="w-3 h-3 text-yellow-400" />
              <span>{showDebug ? "Hide Retrieval Debug Details" : "Show RAG Retrieval Details"}</span>
              {showDebug ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showDebug && (
              <div className="mt-2.5 p-4 rounded-xl bg-[#09090b] border border-zinc-800 text-xs font-mono space-y-2 text-zinc-300">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-zinc-500">Embedding Mode:</span> <span className="text-yellow-400">{debug_info.embedding_mode}</span></div>
                  <div><span className="text-zinc-500">Top-K:</span> <span className="text-zinc-200">{debug_info.top_k}</span></div>
                  <div><span className="text-zinc-500">Active Threshold:</span> <span className="text-zinc-200">{debug_info.similarity_threshold}</span></div>
                  <div><span className="text-zinc-500">Top Similarity:</span> <span className="text-emerald-400">{debug_info.highest_similarity_score}</span></div>
                </div>

                <div className="pt-2 border-t border-zinc-800">
                  <span className="text-zinc-400 block mb-1">Retrieved Context Chunks:</span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {debug_info.retrieved_chunks.map((rc, idx) => (
                      <div key={idx} className="p-2 rounded bg-[#121215] border border-zinc-800 flex justify-between items-center text-[10px]">
                        <span className="text-zinc-300">{rc.filename} {rc.page_number ? `(Page ${rc.page_number})` : ''}</span>
                        <span className="text-yellow-400 font-bold">{rc.similarity_score} score</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
