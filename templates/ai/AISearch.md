# AISearch

**File:** `AISearch.template.json`

**Purpose:** Configures AI search — query processing with multi-strategy selection, filter operators, ranking with decay functions, pagination, scoring weights, and faceted aggregations.

**Inputs:** `query` (text, strategy, embedding), `filters` (field, operator, value), `ranking` (primaryField, boostFields, decayFunction), `pagination` (page, pageSize), `scoring` (weights), `aggregations`.

**Outputs:** Ranked `results` array with `id`, `score`, `rank`, `snippet` and aggregation buckets.

**Dependencies:** AIEmbedding (semantic search vectors), AIRanking (scoring/ranking), AIRetrieval (search strategy implementations).

**Relationships:** AIEmbedding, AIRanking, AIRetrieval, AIContext.

**Validation Rules:** `pagination.pageSize` max 1000; `scoring` weights must sum to ≤ 1.0; `filter.operator` must be one of the supported set; `decayFunction` must be `linear`, `exponential`, `gaussian`, or `step`.

**Future Extensions:**
- Add geo-spatial search capabilities.
- Support hybrid search with cross-modal relevance.
