# AIValidation

**File:** `AIValidation.template.json`

**Purpose:** Validates AI outputs against canon compliance, constraint rules, format expectations, factual accuracy (with source entities), and hallucination detection.

**Inputs:** `canonCompliance` (strictness, violations), `constraintValidation` (constraints list), `formatValidation` (expectedFormat), `factualAccuracy` (sourceEntities), `hallucinationDetection` (method).

**Outputs:** `overallResult` — `passed`, `failed`, or `warning` — with detailed violation and risk reports.

**Dependencies:** AICanon (canon rules for compliance), AIReference (source entities for factual accuracy), AIEmbedding (hallucination detection via embedding-distance).

**Relationships:** AICanon, AIReference, AIEmbedding, AIReasoning, AITask.

**Validation Rules:** `hallucinationDetection.method` must be `embedding-distance`, `fact-check`, or `consensus`; `factualAccuracy.score` is 0–1; overall result aggregates all sub-validations.

**Future Extensions:**
- Add content safety and toxicity filters.
- Implement adaptive strictness based on task sensitivity.
