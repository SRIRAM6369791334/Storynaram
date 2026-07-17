# BaseSecurity

**File:** `BaseSecurity.schema.json`

**Purpose:** Security configuration block — data classification, encryption, field redaction, audit logging, and access policy identifiers.

**Referenced Template:** `templates/base/BaseSecurity.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** none

**Key Constraints:** `classification` enum: `public`, `internal`, `confidential`, `restricted`, `secret`. `encryption.atRest` defaults false, `inTransit` defaults true. `redaction[].method` enum: `mask`, `truncate`, `hash`, `remove`. `auditLogging.enabled` defaults true, `retentionDays` defaults 365.

**Validation Notes:** `classification` follows a strict hierarchy from least to most restrictive. Field-level encryption is tracked in `encryptedFields`. Redaction methods specify how sensitive data is obscured.

**Backward Compatibility:** Adding new classification/redaction values is additive. All sections are optional.
