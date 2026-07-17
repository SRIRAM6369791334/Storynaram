# BaseIdentifier

**File:** `BaseIdentifier.schema.json`

**Purpose:** Universal identifier schema — every entity must have exactly one identifier block with a globally unique id, prefix, sequence, and type.

**Referenced Template:** `templates/base/BaseIdentifier.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** `id`, `prefix`, `sequence`, `type`

**Key Constraints:** `id` must match `^[a-z]+_[0-9]{6,}$`; `sequence` must match `^[0-9]{6,}$`; `legacyIds[].system` and `legacyIds[].value` are required for each entry.

**Validation Notes:** The `id` pattern enforces `{prefix}_{sequence}` format. Legacy Ids track migrations from external systems.

**Backward Compatibility:** Adding optional fields (`displayId`, `namespace`, `legacyIds`) is additive and non-breaking.
