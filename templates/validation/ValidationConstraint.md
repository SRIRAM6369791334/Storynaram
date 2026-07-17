# ValidationConstraint

**File:** `ValidationConstraint.template.json`

**Purpose:** Defines structural or behavioral constraints such as required, unique, immutable, conditional, temporal, or cross-field rules.

**Inputs:** `constraintId`, `name`, `type`, `scope`, `field`, `fields`, `condition`, `params`, `message`, `severity`

**Outputs:** A constraint definition enforced by the validation engine across entities and fields.

**Dependencies:** Referenced by `ValidationRule` (as constraint source); may reference entity templates for field validation.

**Validation Rules:** Enforces `type` enum (`required`, `unique`, `immutable`, `conditional`, `temporal`, `crossField`); validates condition expression syntax; checks scope enum.

**Future Extensions:** Time-windowed constraints that activate and deactivate on schedules.
