# AIContext

**File:** `AIContext.schema.json`

**Purpose:** Aggregated context bundle passed to the AI for story-aware generation.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AIContext.template.json`

**Required Properties:** none

**Key Enums:** none

**Validation Notes:** All sub-objects use `unevaluatedProperties: false`; pluginContext allows additional properties.

**Runtime Role:** Injected into every AI generation call to provide multi-layered story, world, scene, memory, and session context.

**Cross-References:** AIPrompt, AIMemory, AISession, AIConversation
