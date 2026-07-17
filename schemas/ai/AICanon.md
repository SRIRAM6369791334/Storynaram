# AICanon

**File:** `AICanon.schema.json`

**Purpose:** Canon rules, verification mode, and conflict detection configuration for maintaining story consistency.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AICanon.template.json`

**Required Properties:** none

**Key Enums:** verificationMode (strict, lenient, suggestive); category (fact, relationship, timeline, rule, character, world)

**Validation Notes:** importance 0-100; conflictDetection.threshold 0-1; verifiedAt uses date-time format.

**Runtime Role:** Enforces story canon by validating AI output against defined rules and detecting contradictions.

**Cross-References:** AIValidation, AIReasoning, AIRetrieval, AIPrompt
