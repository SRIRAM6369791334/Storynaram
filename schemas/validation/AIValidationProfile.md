# AIValidationProfile

**File:** `AIValidationProfile.schema.json`

**Purpose:** Configures AI-assisted validation including model selection, thresholds, and prompt templates.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/AIValidationProfile.template.json`

**Required Properties:** `profileName`, `model`, `threshold`

**Key Enums:** `model` (gpt-4, claude-3, local), `threshold` (strict, balanced, relaxed)

**Validation Scope:** ai

**Cross-References:** ValidationProfile, SecurityValidation
