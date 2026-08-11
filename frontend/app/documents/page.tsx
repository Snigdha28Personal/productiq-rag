"use client";

import { useEffect, useState } from "react";
import { fetchDocuments } from "../../lib/api";
import { DocumentMetadata } from "../../lib/types";
import DocumentUploader from "../../components/DocumentUploader";
import DocumentTable from "../../components/DocumentTable";
import LoadingState from "../../components/LoadingState";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocs = async () => {
    try {
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Research Document Library</h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload and manage customer interviews, support tickets, survey responses, and feedback files.
        </p>
      </div>

      <DocumentUploader onUploadSuccess={loadDocs} />

      {loading ? <LoadingState message="Loading document library..." /> : <DocumentTable documents={documents} />}
    </div>
  );
}
