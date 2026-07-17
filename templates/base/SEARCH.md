# BaseSearch

## Purpose
Configures search behavior per entity type. Supports full-text, keyword, semantic, and hybrid search with boosting and ranking.

## Required Fields
None (all optional)

## Optional Fields
- `searchable` — whether entity participates in search (default: true)
- `fullText` — full-text search field config
- `keyword` — keyword search boost terms
- `semantic` — vector/semantic search config
- `hybrid` — full-text vs semantic weighting
- `filters` — allowed filter dimensions
- `boosts` — field-level boost multipliers
- `ranking` — default sort, score/popularity/recency factors

## Inheritance Rules
- **Final**: `searchable`
- **Overrideable**: `fullText`, `keyword`, `semantic`, `hybrid`, `filters`, `boosts`, `ranking`
