# BaseTag

**File:** `BaseTag.schema.json`

**Purpose:** Tag and label system — flat tags, hierarchical categories, colored visual labels, and taxonomy metadata for classification.

**Referenced Template:** `templates/base/BaseTag.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** none

**Key Constraints:** `labels[].color` must match `^#[0-9A-Fa-f]{6}$` (hex color). `categories[].path` is slash-delimited. `taxonomy` supports `broader`/`narrower` hierarchical relationships.

**Validation Notes:** Tags are optional. Tags support namespaced key-value pairs. Categories use a path-based hierarchy. Labels include color hints for UI rendering.

**Backward Compatibility:** All sections are optional and additive.
