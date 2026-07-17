# Ranking Directory

## Purpose
The Ranking Algorithm Architecture. Defines how results are ranked for relevance, priority, and recency.

## Responsibility
Provides ranking algorithms that determine the order of results presented to the AI or user. Ranking considers multiple factors â€” query relevance, entity priority, recency of change, relationship strength, and canon status.

## Ranking Factors
| Factor | Weight | Description |
|--------|--------|-------------|
| Query Relevance | High | How well the result matches the query |
| Entity Priority | Medium | Priority of the entity type (character > item) |
| Recency | Medium | How recently the entity was modified |
| Relationship Strength | Medium | How strongly related to current context |
| Canon Status | Low | Canonical entities rank higher |
| User Preference | Low | Based on past user behavior |

## Input
- Search/retrieval results
- Query context
- User preferences

## Output
- Ranked result list with scores
- Ranking explanation for transparency

## Dependencies
- retrieval/ â€” results to rank
- search/ â€” search results to rank
- context/ â€” context for relevance calculation
