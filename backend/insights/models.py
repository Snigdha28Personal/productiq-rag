from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PainPointInsight(BaseModel):
    category: str
    description: str
    observed_mentions: int
    impact_level: str  # "High", "Medium", "Low"
    supporting_documents: List[str]
    sample_quotes: List[str]
    confidence_score: float

class CustomerSegmentInsight(BaseModel):
    segment: str  # "Enterprise", "SMB", "Startup"
    top_concerns: List[str]
    mentioned_features: List[str]
    sample_documents: List[str]

class FeatureRequestInsight(BaseModel):
    feature_name: str
    description: str
    observed_mentions: int
    requesting_segments: List[str]
    evidence_strength: str  # "Strong", "Moderate", "Emerging"

class InsightSummary(BaseModel):
    total_documents_analyzed: int
    total_chunks_processed: int
    top_pain_points: List[PainPointInsight]
    customer_segments: List[CustomerSegmentInsight]
    feature_requests: List[FeatureRequestInsight]
    disclaimer: str = "Observed mentions are derived directly from the uploaded research corpus and reflect frequency within this dataset."
