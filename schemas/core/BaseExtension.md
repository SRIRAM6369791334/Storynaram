# BaseExtension

**File:** `BaseExtension.schema.json`

**Purpose:** Extension and customization point — plugin registration, custom fields, custom metadata, custom components, and schema-level extensions.

**Referenced Template:** `templates/base/BaseExtension.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** none

**Key Constraints:** `pluginRegistration[].enabled` defaults true. `customFields` is an object with per-field type/schema/validated metadata. `customComponents[].type` enum: `ui`, `processor`, `renderer`, `hook`, `middleware`. `schemaExtensions` allow arbitrary scope+definition pairs.

**Validation Notes:** `customFields` supports per-field schema references and validation flags. `customMetadata` allows any valid JSON. `schemaExtensions` enable runtime schema modification.

**Backward Compatibility:** Adding new component types is additive. All sections are optional.
