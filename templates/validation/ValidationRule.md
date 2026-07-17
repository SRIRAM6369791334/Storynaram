# ValidationRule

**File:** `ValidationRule.template.json`

**Purpose:** Defines a single validation rule with field-level, entity-level, or cross-entity constraints, severity, and error messaging.

**Inputs:** `ruleId`, `name`, `scope`, `severity`, `category`, `field`, `condition`, `params`, `message`, `errorCode`, `recovery`, `enabled`, `tags`

**Outputs:** A configured rule instance that the validation engine evaluates against entities.

**Dependencies:** `ValidationProfile` groups rules; `ValidationResult` collects rule outcomes.

**Validation Rules:** Validates scope, severity, and category enum values; ensures condition expression is valid; checks field JSON path format.

**Future Extensions:** Support for composite rules combining multiple conditions with logical operators.
