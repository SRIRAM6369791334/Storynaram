# AICanon

**File:** `AICanon.template.json`

**Purpose:** Ensures AI responses respect canonical truth through strict/lenient/suggestive verification modes, categorized canon rules, and automated conflict detection.

**Inputs:** `verificationMode`, `canonRules` (canonId, statement, importance 0–100, category), `conflictDetection` (enabled, threshold 0–1).

**Outputs:** `verificationResult` with `passed` boolean, `violations` array, `warnings` array.

**Dependencies:** AIValidation (canon compliance checks), AIRetrieval (canon retrieval), AIMemory (canon memory integration).

**Relationships:** AIValidation, AIRetrieval, AIMemory, AIPrompt, AIReasoning.

**Validation Rules:** Categories must be one of: `fact`, `relationship`, `timeline`, `rule`, `character`, `world`; `importance` must be 0–100; `conflictDetection.threshold` defaults to 0.8.

**Future Extensions:**
- Add automated canon suggestion from AI-generated content.
- Implement temporal canon versioning for retcons.
