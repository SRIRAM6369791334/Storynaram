# AIPrompt

**File:** `AIPrompt.template.json`

**Purpose:** Assembles the final AI prompt by injecting system, developer, and user instructions with context, memory, canon constraints, few-shot examples, and output guardrails.

**Inputs:** `systemPrompt`, `developerPrompt`, `userPrompt`, `contextInjection` (source + priority), `memoryInjection`, `canonInjection` (severity), `examples`, `constraints`, `outputInstructions`.

**Outputs:** A fully constructed prompt payload ready for LLM inference.

**Dependencies:** AIContext (context sources), AIMemory (memory injection), AICanon (canon constraints).

**Relationships:** AIContext, AIMemory, AICanon, AIReasoning, AITokenBudget.

**Validation Rules:** `contextInjection.priority` must be 0–100; `canonInjection.severity` must be one of `absolute`, `strong`, `suggestion`; system prompt is required.

**Future Extensions:**
- Add prompt template versioning and A/B testing.
- Support dynamic prompt compression based on token budget.
