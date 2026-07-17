# AITokenBudget

**File:** `AITokenBudget.template.json`

**Purpose:** Manages token budget allocation across the context window — priority levels, chunking strategies (fixed/sliding/semantic/recursive), compression methods, overflow handling, and per-component budgeting.

**Inputs:** `maxContextTokens` (min 1024), `priorityLevels` (level, label, maxTokens, evictable), `chunking` (strategy, chunkSize, overlap), `compression` (method, ratio), `overflow` (strategy, fallbackModel), `allocation` (per-component limits).

**Outputs:** Allocated token budgets per component and overflow resolution actions.

**Dependencies:** AIPrompt (token allocation for prompt), AIContext (context size), AIMemory (memory token usage).

**Relationships:** AIPrompt, AIContext, AIMemory, AISession, AIConfiguration.

**Validation Rules:** `maxContextTokens` ≥ 1024; `priorityLevels.level` must be 0–100; `compression.compressionRatio` must be 0–1; `overflow.strategy` must be one of the supported types.

**Future Extensions:**
- Add dynamic budget rebalancing based on real-time usage.
- Support model-specific token budget profiles.
