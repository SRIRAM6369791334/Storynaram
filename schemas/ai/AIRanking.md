# AIRanking

**File:** `AIRanking.schema.json`

**Purpose:** Multi-factor relevance scoring, context priority, importance, recency, audience, and combined score.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AIRanking.template.json`

**Required Properties:** none

**Key Enums:** none (numeric scores 0-1 and 0-100)

**Validation Notes:** All score fields clamped to 0-1; importance fields 0-100; finalRank minimum 1.

**Runtime Role:** Computes a final rank by combining relevance, context priority, importance, recency, and audience engagement scores.

**Cross-References:** AISearch, AIRetrieval, AIReference, AITokenBudget
