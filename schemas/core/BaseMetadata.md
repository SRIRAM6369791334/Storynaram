# BaseMetadata

**File:** `BaseMetadata.schema.json`

**Purpose:** Descriptive metadata block — title, description, summary, keywords, language, author, priority, and semantic version.

**Referenced Template:** `templates/base/BaseMetadata.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** `title`, `language`

**Key Constraints:** `title` length 1–256; `description` max 4096; `summary` max 512; `language` pattern `^[a-z]{2}(-[A-Z]{2})?$`; `priority` integer 0–100; `version` pattern `^\d+\.\d+\.\d+$`; `keywords` items max 64 chars.

**Validation Notes:** Language uses BCP 47 format (e.g. `en`, `fr-CA`). Version must follow semver.

**Backward Compatibility:** Fully additive — all fields are optional except `title` and `language`.
