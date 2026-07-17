# AISearch

**File:** `AISearch.schema.json`

**Purpose:** Search query, filters, ranking, pagination, and result schema for AI-powered search.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AISearch.template.json`

**Required Properties:** none

**Key Enums:** query strategy (keyword, semantic, hybrid, graph); filter operator (eq, neq, gt, gte, lt, lte, in, nin, contains, exists); decayFunction (linear, exponential, gaussian, step); aggregation type (term, range, date_histogram, nested, avg, sum, min, max, count, top_hits)

**Validation Notes:** page minimum 1; pageSize max 1000; field-level `unevaluatedProperties: false`.

**Runtime Role:** Powers AI-driven search across story entities, memory, and world data with scores and aggregations.

**Cross-References:** AIRetrieval, AIRanking, AIEmbedding, AIReference
