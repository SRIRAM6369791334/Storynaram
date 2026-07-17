# BaseAttachment

**File:** `BaseAttachment.schema.json`

**Purpose:** File and asset attachment block — links to images, audio, documents, and other binary assets with metadata.

**Referenced Template:** `templates/base/BaseAttachment.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** none

**Key Constraints:** `attachments[].type` enum: `image`, `audio`, `video`, `document`, `archive`, `model`, `other`. `url` must be valid URI. `size` is integer (bytes). `hash` is SHA-256 hex string. `coverImage` is URI. `gallery` items are URI strings.

**Validation Notes:** Attachments are references (URLs), not embedded binary data. Hash is SHA-256 for integrity verification.

**Backward Compatibility:** Adding new attachment types to the enum is non-breaking. All sections are optional.
