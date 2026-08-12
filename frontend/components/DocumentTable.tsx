"use client";

import { FileText, CheckCircle2, AlertCircle, Database, Calendar } from "lucide-react";
import { DocumentMetadata } from "../lib/types";

interface DocumentTableProps {
  documents: DocumentMetadata[];
}

export default function DocumentTable({ documents }: DocumentTableProps) {
  if (documents.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[#0f0f11] border border-zinc-800 text-center space-y-2">
        <FileText className="w-10 h-10 text-zinc-500 mx-auto" />
        <h4 className="font-semibold text-zinc-200 text-sm">No Research Documents Uploaded</h4>
        <p className="text-xs text-zinc-400">
          Upload customer interviews, support tickets, surveys, or click "Load Demo Research" in the sidebar.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#0f0f11] border border-zinc-800 shadow-lg overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-yellow-400" />
          <h3 className="font-semibold text-sm text-white">Indexed Research Library</h3>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-500/30">
          {documents.length} Files
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-[#050505] text-zinc-400 uppercase text-[10px] font-bold tracking-wider border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">Document Name</th>
              <th className="py-3 px-4">File Type</th>
              <th className="py-3 px-4">Upload Date</th>
              <th className="py-3 px-4">Processing Status</th>
              <th className="py-3 px-4 text-right">Chunks Indexed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {documents.map((doc) => (
              <tr key={doc.document_id} className="hover:bg-[#18181b] transition-colors">
                <td className="py-3 px-4 font-medium text-white flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span className="truncate max-w-xs">{doc.filename}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-300">
                    {doc.document_type}
                  </span>
                </td>
                <td className="py-3 px-4 text-zinc-400 flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  <span>{doc.upload_date}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-500/40">
                    <CheckCircle2 className="w-3 h-3 text-yellow-400" />
                    <span>Indexed</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-yellow-400">
                  {doc.chunk_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
