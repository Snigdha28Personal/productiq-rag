# ProductIQ RAG Evaluation Framework

This directory contains the automated RAG evaluation framework for **ProductIQ — AI Product Research Copilot**.

## Benchmark Dataset (`test_questions.json`)
Contains 15–20 curated product research questions spanning:
- Grounded in-domain queries (onboarding friction, pricing complaints, enterprise security, integrations)
- Out-of-domain / unsupported queries (testing the insufficient evidence guardrail)

## Evaluated Metrics

1. **Retrieval Recall@K**: Measures the proportion of relevant ground-truth research documents retrieved in the Top-K vector search results.
   $$\text{Recall@K} = \frac{|\text{Retrieved Ground Truth Documents}|}{|\text{Expected Target Documents}|}$$

2. **Citation Accuracy**: Evaluates the correctness of generated inline citations (`[1]`, `[2]`), ensuring citations map directly to expected source documents.
   $$\text{Citation Accuracy} = \frac{|\text{Cited Sources} \cap \text{Expected Sources}|}{|\text{Total Cited Sources}|}$$

3. **Grounded Answer Rate**: Measures the percentage of answers that strictly adhere to grounded evidence (and correctly trigger the insufficient evidence response when context is lacking).

## How to Run Evaluation

```bash
# Run full evaluation suite
python evaluation/evaluate.py
```

Outputs detailed question-by-question metrics and saves a structured JSON log to `evaluation/evaluation_report.json`.
