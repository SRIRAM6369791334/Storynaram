# Search Directory

## Purpose
The Search Engine Architecture. Defines how the AI searches across the entire knowledge base.

## Responsibility
Provides fast, relevant search across all story data â€” entities, relationships, metadata, tags, and full text. Supports multiple search strategies optimized for different query types.

## Search Indexes
| Index Type | Content | Query Type |
|------------|---------|------------|
| Entity Index | All entity data | ID, name, type |
| Metadata Index | Entity metadata | Status, date, creator |
| Reference Index | Cross-entity references | Relationship queries |
| Graph Index | Relationship graph | Path and proximity queries |
| Tag Index | Entity tags | Tag-based filtering |
| Full-Text Index | Descriptions, notes | Text search |

## Input
- Search query string
- Filter parameters
- Index selection

## Output
- Ranked search results
- Relevance scores
- Source references

## Dependencies
- knowledge/ â€” knowledge to index
- retrieval/ â€” uses search indexes for retrieval
- ranking/ â€” ranks search results
- cache/ â€” caches search results
