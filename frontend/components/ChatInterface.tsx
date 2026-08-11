"use client";

import { useState } from "react";
import { Send, Sparkles, HelpCircle, Loader2, ArrowRight } from "lucide-react";
import { queryRAG, loadDemoResearch, logAnalyticsEvent } from "../lib/api";
import { RAGResponse, Citation } from "../lib/types";
import ChatMessage from "./ChatMessage";
import EvidenceDrawer from "./EvidenceDrawer";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content?: string;
  ragResponse?: RAGResponse;
}

interface ChatInterfaceProps {
  onDemoLoaded?: () => void;
}

export default function ChatInterface({ onDemoLoaded }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const exampleQuestions = [
    "What are the top 5 customer pain points?",
    "Which problems are mentioned most frequently?",
    "What are customers saying about onboarding?",
    "What evidence suggests we should improve pricing transparency?",
    "Compare enterprise and SMB customer pain points.",
    "Which feature requests have the strongest supporting evidence?"
  ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    setInput("");
    const userMsg: MessageItem = { id: `user_${Date.now()}`, role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await queryRAG(q);
      const assistantMsg: MessageItem = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        ragResponse: response,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      alert(e.message || "Failed to query RAG model.");
    } finally {
      setLoading(false);
    }
  };

  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation);
    logAnalyticsEvent("citation_clicked", { citation_id: citation.citation_id, filename: citation.filename });
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0b0f17] relative text-slate-100 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-[#232e42] bg-[#0d121f] px-6 flex items-center justify-between z-10">
        <div>
          <h2 className="font-bold text-base text-white flex items-center space-x-2">
            <span>ProductIQ Research Copilot</span>
          </h2>
          <p className="text-xs text-slate-400">Ask natural language questions grounded in customer research</p>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="py-8 space-y-8 animate-in fade-in duration-300">
            {/* Welcome Hero */}
            <div className="text-center space-y-3 max-w-2xl mx-auto pt-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-xl shadow-blue-500/20">
                IQ
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">ProductIQ</h1>
              <p className="text-base text-blue-400 font-semibold">Turn customer research into product decisions.</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Ask questions across interviews, feedback, surveys, and support tickets — with every answer grounded in source evidence.
              </p>
            </div>

            {/* Quick Action & Example Prompts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <span>Example PM Research Questions</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exampleQuestions.map((eq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(eq)}
                    className="p-3.5 rounded-xl bg-[#131926] hover:bg-[#1a2336] border border-[#232e42] hover:border-blue-500/40 text-left transition-all group flex items-center justify-between"
                  >
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white leading-snug">{eq}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <ChatMessage
              key={m.id}
              role={m.role}
              content={m.content}
              ragResponse={m.ragResponse}
              onCitationClick={handleCitationClick}
            />
          ))
        )}

        {loading && (
          <div className="flex items-center space-x-3 text-slate-400 text-xs my-4 p-4 rounded-xl bg-[#131926] border border-[#232e42] animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span>Finding evidence, evaluating grounding threshold, and generating response...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-[#232e42] bg-[#0d121f]">
        <div className="max-w-4xl mx-auto flex items-center space-x-3 bg-[#131926] border border-[#232e42] focus-within:border-blue-500/60 rounded-xl p-2 transition-all shadow-inner">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a research question grounded in uploaded documents..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide-Out Evidence Drawer */}
      <EvidenceDrawer citation={selectedCitation} onClose={() => setSelectedCitation(null)} />
    </div>
  );
}
