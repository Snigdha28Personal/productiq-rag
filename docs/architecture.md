# System Architecture & Technical Design

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Client ["Next.js Frontend (TypeScript / Tailwind CSS)"]
        UI[Chat Interface / Document Library / Insights Dashboard]
        Drawer[Evidence Inspector Drawer]
        Debug[RAG Transparency Panel]
    end

    subgraph Backend ["Python FastAPI Service (Port 8000)"]
        API[FastAPI Endpoints]
        
        subgraph Ingestion ["Ingestion & Preprocessing"]
            Parser[File Parsers: PDF, DOCX, TXT, MD]
            Chunker[Sliding Window Chunker: 600 tokens, 80 overlap]
        end

        subgraph VectorStore ["Vector DB & Embeddings"]
            Embedder[Embedding Abstraction: OpenAI / Local Demo]
            Chroma[(ChromaDB Persistent Vector Store)]
        end

        subgraph RAG ["RAG Orchestrator & Grounding"]
            Retriever[Semantic Similarity Retriever: Top-K=5]
            Grounding[Grounding Evaluator & Threshold Guardrail]
            Generator[Structured Response & Citation Generator]
        end

        Analytics[Local Event Analytics Logger]
        Insights[Insight Extractor Pipeline]
    end

    UI -->|HTTP / JSON| API
    API --> Ingestion
    Parser --> Chunker
    Chunker --> Embedder
    Embedder --> Chroma
    API -->|Query| Retriever
    Retriever --> Chroma
    Chroma -->|Vector Chunks| Grounding
    Grounding -->|Threshold Pass| Generator
    Grounding -->|Threshold Fail| Fallback["Insufficient Evidence Response"]
    Generator --> Drawer
```

## Component Breakdown

1. **Frontend**: Next.js 14 App Router with React, TypeScript, and Tailwind CSS.
2. **Backend API**: Python FastAPI providing async file upload, demo loading, vector query, and insights.
3. **Chunker**: Sliding window chunker preserving page and section context, producing deterministic IDs (`{doc_id}_c{index}_{hash}`).
4. **VectorDB**: ChromaDB cosine similarity store with fallback memory store.
5. **Grounding Guardrail**: Rejects ungrounded queries when highest similarity score falls below `SIMILARITY_THRESHOLD`.
