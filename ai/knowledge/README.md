# Knowledge Directory

## Purpose
The Knowledge Architecture for Storynaram. Defines how the AI understands, indexes, stores, resolves, and manages knowledge about the story universe.

## Responsibility
Manages the complete knowledge lifecycle â€” ingestion, indexing, storage, resolution, caching, synchronization, and retirement. Knowledge is the structured understanding the AI has about every entity, relationship, and rule in the project.

## Components
| Component | Description |
|-----------|-------------|
| Knowledge Base | The complete corpus of story knowledge |
| Knowledge Index | Searchable index of all knowledge entities |
| Knowledge Graph | Relationship graph connecting knowledge nodes |
| Knowledge Store | Persistent storage for knowledge artifacts |
| Knowledge Registry | Catalog of all registered knowledge sources |
| Knowledge Resolver | Resolves references to knowledge entities |
| Knowledge Loader | Loads knowledge into context/memory |
| Knowledge Cache | Cached knowledge for fast retrieval |
| Knowledge References | Cross-references between knowledge nodes |
| Knowledge Metadata | Metadata about knowledge quality and freshness |
| Knowledge Lifecycle | Lifecycle management â€” creation through archival |
| Knowledge Synchronization | Sync between file-based and future database storage |

## Input
- Entity JSON files from all domain directories
- Relationship definitions from core/relationships/
- Standards and contracts from core/
- User instructions and queries

## Output
- Indexed, searchable knowledge
- Resolved references
- Knowledge graph relationships
- Context-optimized knowledge packets

## Dependencies
- core/standards/ â€” knowledge structure follows standards
- core/contracts/ â€” knowledge fields defined by contracts
- core/relationships/ â€” graph relationships follow models
- graph/ â€” graph traversal depends on knowledge structure

## Related Modules
- retrieval/ â€” retrieves from knowledge base
- context/ â€” builds context from knowledge
- memory/ â€” persistent knowledge storage
- search/ â€” indexes knowledge for search
