"use client";

import { Citation } from "../lib/types";

interface CitationChipProps {
  citation: Citation;
  onClick: (citation: Citation) => void;
}

export default function CitationChip({ citation, onClick }: CitationChipProps) {
  return (
    <button
      onClick={() => onClick(citation)}
      title={`Source: ${citation.filename}${citation.page_number ? ` (Page ${citation.page_number})` : ''} - Click to inspect evidence`}
      className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-yellow-400/20 hover:bg-yellow-400 hover:text-black border border-yellow-500/40 text-yellow-300 font-mono text-[11px] font-bold transition-colors cursor-pointer group"
    >
      <span>[{citation.citation_id}]</span>
    </button>
  );
}
