# AIPrompt

**File:** `AIPrompt.schema.json`

**Purpose:** Prompt parts and injection data assembled for an AI generation request.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AIPrompt.template.json`

**Required Properties:** none

**Key Enums:** severity (absolute, strong, suggestion)

**Validation Notes:** contextInjection priority ranges 0-100; all sub-objects use `unevaluatedProperties: false`.

**Runtime Role:** Composes the final prompt by merging system, developer, user parts with context, memory, canon injections, examples, constraints, and output instructions.

**Cross-References:** AIContext, AIMemory, AICanon, AITokenBudget
