# BusinessRule

**File:** `BusinessRule.template.json`

**Purpose:** Defines domain-specific validation logic with conditions, actions, and business-level scope.

**Inputs:** `ruleId`, `name`, `domain`, `description`, `expression`, `severity`, `category`, `scope`, `conditions`, `actions`, `enabled`

**Outputs:** A business rule evaluated during validation to enforce domain-specific constraints.

**Dependencies:** `ValidationProfile` may reference business rules; domain entity templates define the fields the rule validates.

**Validation Rules:** Verifies expression DSL syntax; validates condition and action object structures; enforces scope and category enums.

**Future Extensions:** Rule chaining where one rule's output triggers another rule's evaluation.
