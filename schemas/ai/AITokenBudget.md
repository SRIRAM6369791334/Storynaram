# AITokenBudget

**File:** `AITokenBudget.schema.json`

**Purpose:** Token budget management for context limits, priority allocation, chunking, compression, and overflow handling.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AITokenBudget.template.json`

**Required Properties:** none

**Key Enums:** chunking strategy (fixed, sliding, semantic, recursive); compression method (summarize, truncate, deduplicate, prune, compress); overflow strategy (truncate, summarize, paginate, priorityDrop, error)

**Validation Notes:** maxContextTokens minimum 1024; compressionRatio 0-1; priorityLevel 0-100.

**Runtime Role:** Enforces token limits by allocating budgets per component and applying chunking, compression, or overflow strategies.

**Cross-References:** AIPrompt, AIContext, AISession, AIEmbedding
