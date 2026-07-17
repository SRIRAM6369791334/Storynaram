# BaseSearch

**File:** `BaseSearch.schema.json`

**Purpose:** Search configuration block — full-text, keyword, semantic, and hybrid search settings with filters, boosting, and ranking.

**Referenced Template:** `templates/base/BaseSearch.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** none

**Key Constraints:** `searchable` defaults true. `fullText.enabled` defaults true. `semantic.enabled` defaults false. `semantic.minScore` 0–1. `hybrid.fullTextWeight`/`semanticWeight` 0–1, default 0.5. `filters[].type` enum: `range`, `term`, `exists`, `geo`. `ranking.recencyFactor` 0–1.

**Validation Notes:** Hybrid search weights must sum conceptually (not enforced by schema). Semantic search requires embedding model configuration.

**Backward Compatibility:** All sections are optional and additive. Adding new filter types is non-breaking.
