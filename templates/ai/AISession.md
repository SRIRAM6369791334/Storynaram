# AISession

**File:** `AISession.template.json`

**Purpose:** Manages AI session lifecycle — status tracking (initializing through terminated), model assignment, token usage accumulation, context buffer management, and expiration policies.

**Inputs:** `sessionId`, `status`, `model`, `tokenUsage` (totalInput, totalOutput, totalCached, budgetExceeded), `accumulatedContext` (conversationBuffer, memoryIds, compressionCount), `startedAt`, `expiresAt`.

**Outputs:** Session lifecycle transitions and accumulated context for downstream processing.

**Dependencies:** AITokenBudget (budget tracking), AIConversation (conversation buffer), AIMemory (memory IDs), AIConfiguration (model selection).

**Relationships:** AITokenBudget, AIConversation, AIMemory, AIConfiguration, AIAnalytics.

**Validation Rules:** `status` must be one of: `initializing`, `active`, `idle`, `paused`, `expiring`, `expired`, `terminated`, `error`; `expiresAt` must be after `startedAt`.

**FutureExtensions:**
- Add session checkpointing and restore capability.
- Implement cross-session context stitching for long-running narratives.
