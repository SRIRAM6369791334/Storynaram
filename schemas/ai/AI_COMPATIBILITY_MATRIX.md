# AI Compatibility Matrix

## Model Capabilities by AI Schema

| Schema | GPT-4 | Claude 3 | Gemini Pro | Llama 3 | Mistral | DeepSeek |
|--------|-------|----------|------------|---------|---------|----------|
| AIContext | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AIMemory | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AIRetrieval | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AIEmbedding | ✓* | ✓* | ✓ | ✓ | ✓ | ✓ |
| AIPrompt | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AISummary | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AICanon | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AIReasoning | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AIValidation | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AISearch | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AIRanking | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AIReference | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AITokenBudget | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AIConversation | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AISession | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AIWorkflow | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AIPlanner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AITask | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AIAnalytics | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AIConfiguration | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

\* Requires embedding API support for specific model.

## Feature Support by Model

| Feature | GPT-4 | Claude 3 | Gemini Pro | Llama 3 | Mistral | DeepSeek |
|---------|-------|----------|------------|---------|---------|----------|
| Streaming | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tool/Function Calling | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Structured Output | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Vision | ✓ | ✓ | ✓ | ✓ | × | × |
| System Prompt | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Developer Prompt | × | ✓ | × | × | × | × |
| Max Context | 128K | 200K | 1M | 128K | 32K | 128K |

## Schema Version Compatibility

| Schema Version | Validator Version | Min Runtime Version |
|----------------|------------------|-------------------|
| 1.0.x | Draft 2020-12 | v2.0.0 |
| 1.1.x | Draft 2020-12 | v2.1.0 |
| 2.0.x | Draft 2020-12 | v3.0.0 |

## Forward Compatibility

- New optional properties do not break existing documents
- New enum values maintain lexicographic order
- Deprecated properties remain parseable
- Schema evolution follows `SCHEMA_EVOLUTION.md` rules
