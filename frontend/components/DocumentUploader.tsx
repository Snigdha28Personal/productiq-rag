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
    <div className="p-6 rounded-2xl bg-[#131926] border border-[#232e42] shadow-lg space-y-4">
      <div className="flex items-center space-x-3 border-b border-[#232e42] pb-4">
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-base text-white">Upload Research Documents</h3>
          <p className="text-xs text-slate-400">Supports PDF, DOCX, TXT, and Markdown files up to 15MB</p>
        </div>
      </div>

      <label className="border-2 border-dashed border-[#2b3a54] hover:border-blue-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#0b0f17]/50 group">
        <input
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,.markdown"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <UploadCloud className="w-10 h-10 text-slate-500 group-hover:text-blue-400 mb-2 transition-colors" />
        <span className="text-sm font-medium text-slate-200 group-hover:text-white">
          {uploading ? "Processing Document..." : "Click to select or drag & drop research files"}
        </span>
        <span className="text-xs text-slate-500 mt-1">PDF, DOCX, TXT, MD</span>
      </label>

      {uploading && (
        <div className="flex items-center space-x-2 text-xs text-blue-400 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
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
