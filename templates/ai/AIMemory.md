# AIMemory

**File:** `AIMemory.template.json`

**Purpose:** Manages eight distinct memory types — short-term, long-term, canon, character, world, conversation, working, and archived — for persistent and ephemeral AI recall.

**Inputs:** Memory items with `content`, `timestamp`, `importance` (0–100); character‑partitioned key objects; working memory key-value pairs.

**Outputs:** Consolidated memory arrays used by AIPrompt for injection and by AIRetrieval for search.

**Dependencies:** AICanon (canonMemory source), AIConversation (feeds conversationMemory), AIPrompt (consumer).

**Relationships:** AICanon, AIConversation, AIRetrieval, AIPrompt, AISummary.

**Validation Rules:** `shortTerm` items auto-consolidate to `longTerm` after configurable TTL; `canonMemory` items are read-only after verification.

**Future Extensions:**
- Implement importance-decay functions for automatic archival.
- Add cross-character memory conflict detection.
