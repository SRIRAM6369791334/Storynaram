# AIValidation

**File:** `AIValidation.schema.json`

**Purpose:** Validation configuration for AI output correctness across canon, constraints, format, facts, and hallucination.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AIValidation.template.json`

**Required Properties:** none

**Key Enums:** overallResult (passed, failed, warning); strictness (strict, lenient); method (embedding-distance, fact-check, consensus)

**Validation Notes:** factualAccuracy.score 0-1; hallucinationDetection.riskScore 0-1.

**Runtime Role:** Runs post-generation validation checks and produces an overall pass/fail/warning result.

**Cross-References:** AICanon, AIReasoning, AIRetrieval, AIReference
