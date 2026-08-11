# Technical RAG Pipeline Specification

## Pipeline Workflow

```
[Document File]
       ↓
[File Type Parser (PDF/DOCX/TXT/MD)]
       ↓
[Text Normalization & Page Metadata Mapping]
       ↓
[Sliding-Window Chunker (600 tokens, 80 overlap)]
       ↓
[Metadata Enrichment (doc_id, filename, page_number, chunk_id)]
       ↓
[Vector Embedding Generation (OpenAI / Local Demo)]
       ↓
[ChromaDB Cosine Indexing]
       ↓
[User Natural Language Query]
       ↓
[Query Embedding & Top-K Retrieval (k=5)]
       ↓
[Grounding Threshold Check]
       ├── Below Threshold → "Insufficient Evidence" Guardrail Response
       └── Above Threshold → Structured Answer + Citation Resolution
```

## Chunking Strategy

- **Target Size**: 500–800 tokens (~400–600 words)
- **Overlap**: 50–100 tokens (~40–80 words)
- **Rationale**: 600 tokens provides sufficient semantic context for complex customer feedback paragraphs while maintaining precision during cosine similarity vector retrieval.
- **Metadata**: Each chunk contains `document_id`, `filename`, `document_type`, `upload_date`, `page_number`, `chunk_id`, and `source`.

## Embedding Abstraction

- **Mode A (OpenAI)**: `text-embedding-3-small` generating 1536-dim normalized embeddings.
- **Mode B (Local Demo)**: Deterministic 128-dim dense character/subword n-gram vectorizer. Enables complete keyless evaluation for reviewers.

## Grounding Policy & Thresholds

- **OpenAI Similarity Threshold**: `0.35`
- **Local Demo Similarity Threshold**: `0.15`
- If top chunk score < threshold:
  > *"I couldn't find enough evidence in your uploaded research to answer this confidently."*
