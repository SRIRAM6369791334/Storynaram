# BaseStatus

**File:** `BaseStatus.schema.json`

**Purpose:** Lifecycle state machine — defines valid statuses, transitions, and state metadata for entity lifecycle management.

**Referenced Template:** `templates/base/BaseStatus.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** `status`, `state`

**Key Constraints:** `status` enum: `draft`, `review`, `approved`, `published`, `archived`, `deprecated`, `deleted`. `previousStatus` for rollback. `statusHistory` tracks `from`/`to` transitions with actor and timestamp. `statusFlags` is a string array.

**Validation Notes:** The `status` field is constrained to the defined enum. `state` is a free-form operational state string.

**Backward Compatibility:** Adding new enum values to `status` is additive but may break consumers that switch on exact values.
