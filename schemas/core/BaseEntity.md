# BaseEntity

**File:** `BaseEntity.schema.json`

**Purpose:** Universal entity schema that composes all base schemas into a single aggregate root.

**Referenced Template:** `templates/base/BaseEntity.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** none (all properties are composed via $ref)

**Key Constraints:** Uses `allOf` to merge BaseIdentifier, BaseMetadata, and BaseAudit; all other blocks are optional $ref compositions.

**Validation Notes:** This is a meta-schema — validation is delegated to each composed sub-schema. The `customProperties` object allows arbitrary extension.

**Backward Compatibility:** Adding new $ref blocks is always additive. Removing a $ref is breaking.
