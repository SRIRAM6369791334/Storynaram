# BaseVersion

**File:** `BaseVersion.schema.json`

**Purpose:** System versioning and document lifecycle tracking — schema version, template version, entity version, changelog, and compatibility ranges.

**Referenced Template:** `templates/base/BaseVersion.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** `schemaVersion`, `templateVersion`, `entityVersion`

**Key Constraints:** All three version fields must match `^\d+\.\d+\.\d+$` (semver). `changelog` items include version, date, author, and changes array. `compatibility` defines min/max version ranges.

**Validation Notes:** Version fields enforce strict semver format. Changelog tracks per-version release notes.

**Backward Compatibility:** Adding changelog entries is additive. Narrowing compatibility ranges may break downstream consumers.
