import { 
  SystemStatus, DocumentMetadata, RAGResponse, 
  InsightSummary, AnalyticsSummary 
} from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const res = await fetch(`${BACKEND_URL}/api/status`);
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentMetadata[]> {
  const res = await fetch(`${BACKEND_URL}/api/documents`);
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function uploadDocument(file: File): Promise<{ message: string; document: DocumentMetadata }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BACKEND_URL}/api/documents/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to upload document");
  }
  return res.json();
}

export async function loadDemoResearch(): Promise<{ message: string; documents: DocumentMetadata[]; total_chunks_indexed: number }> {
  const res = await fetch(`${BACKEND_URL}/api/demo/load`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to load demo dataset");
  return res.json();
}

export async function queryRAG(query: string, top_k?: number, threshold?: number): Promise<RAGResponse> {
  const res = await fetch(`${BACKEND_URL}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k, similarity_threshold: threshold }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to execute query");
  }
  return res.json();
}

export async function fetchInsights(): Promise<InsightSummary> {
  const res = await fetch(`${BACKEND_URL}/api/insights`);
  if (!res.ok) throw new Error("Failed to fetch research insights");
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const res = await fetch(`${BACKEND_URL}/api/analytics`);
  if (!res.ok) throw new Error("Failed to fetch analytics summary");
  return res.json();
}

export async function logAnalyticsEvent(eventType: string, details?: any): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: eventType, details }),
    });
  } catch (e) {
    console.error("Failed to log event", e);
  }
}
