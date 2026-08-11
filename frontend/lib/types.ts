export interface Citation {
  citation_id: number;
  document_id: string;
  filename: string;
  page_number?: number;
  chunk_id: string;
  text: string;
  similarity_score: number;
  source: string;
}

export interface DebugInfo {
  query: string;
  embedding_mode: string;
  top_k: number;
  similarity_threshold: number;
  chunks_retrieved: number;
  highest_similarity_score: number;
  has_sufficient_evidence: boolean;
  grounding_explanation: string;
  retrieved_chunks: Array<{
    chunk_id: string;
    filename: string;
    page_number?: number;
    similarity_score: number;
    snippet: string;
  }>;
}

export interface RAGResponse {
  key_finding: string;
  evidence: string[];
  interpretation: string;
  citations: Citation[];
  is_insufficient_evidence: boolean;
  debug_info?: DebugInfo;
}

export interface DocumentMetadata {
  document_id: string;
  filename: string;
  document_type: string;
  upload_date: string;
  file_size_bytes: number;
  processing_status: "indexed" | "processing" | "error";
  chunk_count: number;
  error_message?: string;
}

export interface SystemStatus {
  embedding_mode: string;
  is_openai_available: boolean;
  active_model: string;
  embedding_model: string;
  active_similarity_threshold: number;
  top_k_default: number;
  chunk_size: number;
  chunk_overlap: number;
  indexed_documents_count: number;
  total_chunks_count: number;
}

export interface PainPointInsight {
  category: string;
  description: string;
  observed_mentions: number;
  impact_level: string;
  supporting_documents: string[];
  sample_quotes: string[];
  confidence_score: number;
}

export interface CustomerSegmentInsight {
  segment: string;
  top_concerns: string[];
  mentioned_features: string[];
  sample_documents: string[];
}

export interface FeatureRequestInsight {
  feature_name: string;
  description: string;
  observed_mentions: number;
  requesting_segments: string[];
  evidence_strength: string;
}

export interface InsightSummary {
  total_documents_analyzed: number;
  total_chunks_processed: number;
  top_pain_points: PainPointInsight[];
  customer_segments: CustomerSegmentInsight[];
  feature_requests: FeatureRequestInsight[];
  disclaimer: string;
}

export interface AnalyticsSummary {
  total_events: number;
  documents_uploaded: number;
  documents_processed: number;
  questions_asked: number;
  citation_clicks: number;
  insights_viewed: number;
  average_retrieval_score: number;
  citation_click_through_rate_pct: number;
}
