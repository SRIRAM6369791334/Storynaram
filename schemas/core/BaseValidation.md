# BaseValidation

**File:** `BaseValidation.schema.json`

**Purpose:** Validation rules block — field-level, cross-field, and business rule definitions with configurable severity and triggers.

**Referenced Template:** `templates/base/BaseValidation.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** none

**Key Constraints:** `rules[].type` enum: `required`, `regex`, `enum`, `length`, `range`, `reference`, `unique`, `custom`. `rules[].severity` enum: `error`, `warning`, `info` (default error). `businessRules[].severity` same enum. `validateOn[]` enum: `create`, `update`, `publish`, `import`, `export`, `transition`.

**Validation Notes:** Rules target fields by JSON path. Business rules use a validation DSL expression. Custom validators reference plugin by ID.

**Backward Compatibility:** Adding new rule types, severity levels, or triggers is additive. All sections are optional.
