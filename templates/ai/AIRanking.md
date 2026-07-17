# AIRanking

**File:** `AIRanking.template.json`

**Purpose:** Computes multi-factor relevance scoring across five dimensions — semantic relevance, context priority, global/local importance, recency (with decay), and audience engagement — for a combined final rank.

**Inputs:** `relevance` (score, confidence, semanticSimilarity), `contextPriority` (priority, narrativeRelevance), `importance` (globalImportance, plotImpact, characterImpact), `recency` (timestamp, halfLife), `audience` (engagementScore, demographicFit).

**Outputs:** `combinedScore` with weighted breakdown and `finalRank` (integer position ≥ 1).

**Dependencies:** AISearch (ranking config), AIRetrieval (score inputs), AIReference (entity/relationship context).

**Relationships:** AISearch, AIRetrieval, AIReference, AIAnalytics.

**Validation Rules:** All score fields are 0–1; `importance` values are 0–100 integers; `combinedScore.total` is the weighted sum of all contributions; `finalRank` must be ≥ 1.

**Future Extensions:**
- Add user-personalized ranking signals.
- Support machine-learned ranking model integration.
