# Retrieval Directory

## Purpose
The Retrieval Architecture. Defines how information is retrieved from the knowledge base to support AI operations.

## Responsibility
Provides a multi-strategy retrieval pipeline that selects the optimal retrieval method based on the query type â€” keyword search for precise lookups, semantic search for conceptual queries, hybrid search for balanced results, and graph traversal for relationship queries.

## Retrieval Strategies
| Strategy | Use Case | Method |
|----------|----------|--------|
| Keyword Search | Exact ID, name, tag lookups | Inverted index matching |
| Semantic Search | Conceptual queries | Embedding similarity (future) |
| Hybrid Search | Balanced precision/recall | Combined keyword + semantic |
| Reference Search | Cross-entity reference resolution | ID-based lookup |
| Relationship Search | Graph queries | Edge traversal |
| Metadata Filtering | Filtered queries | Field-based filtering |

## Input
- User/AI query
- Query type classification
- Filter parameters

## Output
- Ranked result list with relevance scores
- Retrieved knowledge packets
- Source references

## Dependencies
- knowledge/ â€” knowledge base for retrieval
- search/ â€” search indexes
- ranking/ â€” result ranking algorithms
- cache/ â€” cached retrieval results

## Related Modules
- context/ â€” builds context from retrieved knowledge
- pipeline/ â€” retrieval pipeline orchestration
