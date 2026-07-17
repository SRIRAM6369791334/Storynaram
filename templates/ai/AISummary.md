# AISummary

**File:** `AISummary.template.json`

**Purpose:** Generates and manages automated summaries of entities, contexts, and conversations using extractive, abstractive, or hybrid strategies.

**Inputs:** `enabled`, `strategy`, `maxLength` (50–4096), `targetFields`, `regenerateOnUpdate`.

**Outputs:** Versioned summary array with `version`, `summary`, `model`, `generatedAt`, and `tokens`.

**Dependencies:** AIReasoning (summary generation), AIConversation (conversation summarization), AIContext (entity/context summarization).

**Relationships:** AIReasoning, AIConversation, AIContext, AITokenBudget.

**Validation Rules:** `maxLength` must be between 50 and 4096; `strategy` must be one of `extractive`, `abstractive`, or `hybrid`; summaries are regenerated when source data changes if `regenerateOnUpdate` is true.

**Future Extensions:**
- Add hierarchical summarization (chapter → book → series).
- Support multi-language summary generation.
