# BaseAudit

**File:** `BaseAudit.schema.json`

**Purpose:** Provenance and accountability block — tracks who created, updated, approved, reviewed, and locked each entity with timestamps.

**Referenced Template:** `templates/base/BaseAudit.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Constraints:** All timestamp fields use `date-time` format (ISO 8601). `revision` is a free-form string (UUID or hash). `revisionNotes` is an array of annotated revision entries.

**Validation Notes:** The `revisionNotes` array provides an explicit change log. `lockedBy`/`lockedAt` indicate optimistic locking state.

**Backward Compatibility:** Adding optional fields (approved, reviewed, locked, revision) is non-breaking.
