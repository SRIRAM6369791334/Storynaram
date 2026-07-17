# AIMemory

**File:** `AIMemory.schema.json`

**Purpose:** Structured memory store used by the AI to maintain narrative continuity.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AIMemory.template.json`

**Required Properties:** none

**Key Enums:** importance (integer 0-100)

**Validation Notes:** All items use `unevaluatedProperties: false`; characterMemory is a keyed map of arrays.

**Runtime Role:** Persists and retrieves short-term, long-term, character, world, canon, conversation, working, and archived memory across sessions.

**Cross-References:** AIContext, AICanon, AIRetrieval, AIRanking
