# BaseHistory

**File:** `BaseHistory.schema.json`

**Purpose:** Change history and event log — every mutation recorded as time-ordered events with field-level diffs.

**Referenced Template:** `templates/base/BaseHistory.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** none

**Key Constraints:** `events[].type` enum: `created`, `updated`, `deleted`, `restored`, `archived`, `published`, `unpublished`, `merged`, `forked`, `imported`, `exported`, `approved`, `rejected`, `reviewed`, `locked`, `unlocked`, `transferred`, `custom`. `changes[].diffType` enum: `added`, `removed`, `modified`. Events ordered newest-first.

**Validation Notes:** Event types cover all major state transitions. Field-level diffs track old/new values for audit. `eventCount` and `lastEvent` are denormalized for performance.

**Backward Compatibility:** Adding new event types is additive. All sections are optional.
