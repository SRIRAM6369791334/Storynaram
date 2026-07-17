# AIContext

**File:** `AIContext.template.json`

**Purpose:** Assembles all available context — entity, story, world, timeline, scene, conversation, memory, session, and plugin sources — for an AI request.

**Inputs:** `entityContext`, `storyContext`, `worldContext`, `timelineContext`, `sceneContext`, `conversationContext`, `memoryContext`, `sessionContext`, `pluginContext`.

**Outputs:** A consolidated context payload injected into prompts for generation or reasoning.

**Dependencies:** AIMemory (for memory context), AIPrompt (consumer of context), AISession (session context).

**Relationships:** AIPrompt, AIMemory, AISession, AISearch.

**Validation Rules:** At minimum, `entityContext.entityId` must be present; `storyContext.bookId` is required for story-scoped operations.

**Future Extensions:**
- Add multi-modal context support (image, audio references).
- Support dynamic context prioritization based on task type.
