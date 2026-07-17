# IntegrationProfile

**File:** `IntegrationProfile.template.json`

**Purpose:** Defines validation integration between layers with integration points, validation rules, field mappings, and compatibility checks.

**Inputs:** `profileId`, `name`, `sourceLayer`, `targetLayer`, `integrationPoints`, `validationRules`, `mappings`, `compatibility`, `enabled`

**Outputs:** An integration profile that governs cross-layer validation workflows.

**Dependencies:** Templates from source and target layers; `ValidationRule` for cross-layer rules; `ValidationProfile` for execution; `CompatibilityValidation` for layer compatibility.

**Validation Rules:** Validates layer enum values; ensures integration points define valid bidirectional contracts; verifies mappings reference real fields in both layers; checks cross-layer compatibility configuration.

**Future Extensions:** Auto-discovery of integration points through layer schema introspection.
