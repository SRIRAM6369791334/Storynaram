# BaseIndex

## Purpose
Defines database index strategies per entity type. Generates DDL for PostgreSQL, Neo4j, vector databases, and search engines.

## Required Fields
None (all optional)

## Optional Fields
- `indexes` — PostgreSQL-compatible index definitions
- `graphIndexes` — Neo4j node/edge index config
- `vectorIndexes` — vector DB index config (HNSW, IVFFlat)
- `searchIndexes` — search engine analyzer/mapping config

## Inheritance Rules
- **Final**: none
- **Overrideable**: `indexes`, `graphIndexes`, `vectorIndexes`, `searchIndexes`
