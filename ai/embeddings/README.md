# Embeddings Directory

## Purpose
The Embedding Architecture. Defines the future-ready design for vector embeddings and semantic search.

## Responsibility
Provides the architectural blueprint for embedding-based semantic understanding â€” chunking strategy, vector storage, similarity search, and embedding versioning. This is a design document, not an implementation.

## Architecture (Future)
`	ext
Source Documents â†’ Chunking â†’ Embedding Model â†’ Vector Storage
                                                      â†“
User Query â†’ Embedding Model â†’ Vector Search â†’ Ranked Results
`

## Chunking Strategy
| Strategy | Use Case |
|----------|----------|
| Entity Chunking | One embedding per entity |
| Section Chunking | Embedding per document section |
| Semantic Chunking | Embedding per semantic unit |
| Overlap Chunking | Overlapping windows for context |

## Vector Storage
- **Phase 1**: File-based (JSON arrays of vectors)
- **Phase 2**: Embedded vector database (SQLite + extensions)
- **Phase 3**: Dedicated vector database (Pinecone, Qdrant, Weaviate)

## Input
- Documents and entities to embed
- Query text for similarity search

## Output
- Vector embeddings
- Similarity search results

## Dependencies
- knowledge/ â€” content to embed
- search/ â€” embedding-indexed search
- retrieval/ â€” semantic retrieval uses embeddings
