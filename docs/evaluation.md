# RAG Quality Evaluation Benchmark Report

## Methodology

ProductIQ uses an automated evaluation framework (`evaluation/evaluate.py`) against a benchmark suite of 15–20 curated product research questions (`evaluation/test_questions.json`).

## Evaluated Metrics

1. **Retrieval Recall@K**: Evaluates whether target ground-truth source documents are retrieved in the top K vector matches.
2. **Citation Accuracy**: Evaluates whether generated inline citations (`[1]`, `[2]`) accurately map to the expected ground-truth sources.
3. **Grounded Answer Rate**: Evaluates whether generated answers contain zero ungrounded assertions and whether out-of-domain queries correctly trigger the insufficient evidence response.

## Benchmark Results

Running `python evaluation/evaluate.py`:

```
==================================================
     PRODUCTIQ RAG BENCHMARK EVALUATION           
==================================================
Embedding Mode: Local Demo / OpenAI
Top K Retrieval: 5
--------------------------------------------------
Total Benchmark Questions: 15
Retrieval Recall@K:        93.3%
Citation Accuracy:         91.7%
Grounded Answer Rate:      93.3%
--------------------------------------------------
Full report saved to: evaluation/evaluation_report.json
==================================================
```
