# Mistakes & Technical Learnings

*Key architectural and product iteration learnings from building ProductIQ.*

---

### 1. Answers Without Inline Citations Destroyed User Trust
- **Initial Problem**: In early prototypes, the LLM synthesized concise answers from retrieved context but did not cite specific chunks or page numbers. Product Managers reviewing the output questioned whether claims were hallucinated or genuine.
- **Iteration & Fix**: Implemented mandatory inline bracket citations (`[1]`, `[2]`) linked directly to an interactive right-side **Evidence Inspector Drawer**. PMs can now click any citation to inspect the exact raw source passage, page number, and similarity score.

---

### 2. Similarity Threshold Calibration Varies Significantly Across Embedding Models
- **Initial Problem**: We initially set a static cosine similarity threshold (`0.35`) for relevance filtering. When switching between OpenAI `text-embedding-3-small` and local vector models, score distributions shifted dramatically, causing valid chunks to be rejected under local mode or false positives under OpenAI.
- **Iteration & Fix**: Created configurable, model-aware threshold settings (`SIMILARITY_THRESHOLD_OPENAI=0.35`, `SIMILARITY_THRESHOLD_LOCAL=0.15`) in `backend/config.py`.

---

### 3. Small Chunks Improved Retrieval Precision but Lost Narrative Context
- **Initial Problem**: Chunking at 200 tokens yielded high cosine similarity scores for short keyword matches but stripped surrounding interview context needed for nuanced PM interpretation.
- **Iteration & Fix**: Increased default chunk size to 600 tokens with an 80-token sliding overlap. This preserves paragraph-level context while maintaining high vector retrieval recall.

---

### 4. Increasing Top-K Beyond 5 Introduced Irrelevant Noise
- **Initial Problem**: Raising `top_k` to 10 increased retrieval recall slightly, but introduced low-relevance chunks that polluted the LLM prompt and caused rambling interpretations.
- **Iteration & Fix**: Standardized default `top_k` at 5 combined with similarity threshold filtering before context assembly.

---

### 5. Explicit "Insufficient Evidence" State vs. Generic "I Don't Know"
- **Initial Problem**: Generic fallback messages like "I don't know" felt unhelpful and uninformative to PMs.
- **Iteration & Fix**: Implemented an explicit grounding rule returning structured feedback:
  > *"I couldn't find enough evidence in your uploaded research to answer this confidently."*
  along with transparency metadata explaining the highest retrieved score vs active threshold.

---

### 6. Raw Insight Frequency Counts Can Mislead Small Datasets
- **Initial Problem**: Displaying "34% of customers complained about pricing" based on 10 uploaded documents creates a false sense of statistical validity.
- **Iteration & Fix**: Added a methodology disclaimer framing insight frequency as *"Observed mentions in uploaded research"* rather than statistically representative population percentages.
