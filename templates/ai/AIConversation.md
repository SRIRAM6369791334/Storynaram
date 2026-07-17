# AIConversation

**File:** `AIConversation.template.json`

**Purpose:** Tracks conversation state — turn management, participant profiles (user/ai/character/system), topic evolution, per-participant sentiment, summarization checkpoints, and lifecycle state.

**Inputs:** `conversationId`, `turns` (turnNumber, participantId, message, tokens), `participants` (type, name, turnCount), `topics` (label, startTurn, endTurn), `sentiment` (perParticipant, sentimentTrend), `summary` (lastSummaryTurn).

**Outputs:** Conversation state (`active`, `paused`, `archived`, `completed`, `expired`) and summary text.

**Dependencies:** AISession (session-scoped conversation), AISummary (conversation summarization), AIContext (conversation context).

**Relationships:** AISession, AISummary, AIContext, AIMemory, AIAnalytics.

**Validation Rules:** `sentiment` values must be -1 to 1; `state` must be one of the five enumerated states; `turns` must have sequential `turnNumber` values.

**Future Extensions:**
- Add multi-threaded conversation branching.
- Support real-time collaboration with multiple participants.
