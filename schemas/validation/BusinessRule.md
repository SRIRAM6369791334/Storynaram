# BusinessRule

**File:** `BusinessRule.schema.json`

**Purpose:** Encodes a domain-specific business rule with trigger conditions and actions.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/BusinessRule.template.json`

**Required Properties:** `ruleName`, `condition`, `effect`

**Key Enums:** `effect` (block, warn, allow, override)

**Validation Scope:** entity / cross-entity

**Cross-References:** ValidationRule, WorkflowValidation, CanonIntegrity
