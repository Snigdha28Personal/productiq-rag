"use client";

import { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { uploadDocument } from "../lib/api";

interface DocumentUploaderProps {
  onUploadSuccess: () => void;
}

export default function DocumentUploader({ onUploadSuccess }: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMsg(`Ingesting ${file.name}... Parsing, chunking & creating vector index...`);
    setErrorMsg(null);

    try {
      await uploadDocument(file);
      setStatusMsg(`Successfully processed and indexed ${file.name}!`);
      onUploadSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process document.");
      setStatusMsg(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#0f0f11] border border-zinc-800 shadow-lg space-y-4">
      <div className="flex items-center space-x-3 border-b border-zinc-800 pb-4">
        <div className="p-2.5 rounded-xl bg-yellow-400/10 text-yellow-400">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-base text-white">Upload Research Documents</h3>
          <p className="text-xs text-zinc-400">Supports PDF, DOCX, TXT, and Markdown files up to 15MB</p>
        </div>
      </div>

      <label className="border-2 border-dashed border-zinc-700 hover:border-yellow-400 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#050505]/50 group">
        <input
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,.markdown"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <UploadCloud className="w-10 h-10 text-zinc-500 group-hover:text-yellow-400 mb-2 transition-colors" />
        <span className="text-sm font-medium text-zinc-200 group-hover:text-yellow-300">
          {uploading ? "Processing Document..." : "Click to select or drag & drop research files"}
        </span>
        <span className="text-xs text-zinc-500 mt-1">PDF, DOCX, TXT, MD</span>
      </label>

      {uploading && (
        <div className="flex items-center space-x-2 text-xs text-yellow-400 bg-yellow-400/10 p-3 rounded-lg border border-yellow-500/20">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{statusMsg}</span>
        </div>
      )}

      {statusMsg && !uploading && (
        <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
