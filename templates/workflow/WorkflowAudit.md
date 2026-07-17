# WorkflowAudit

**File:** `WorkflowAudit.template.json`

**Purpose:** Immutable audit trail with event logging, change tracking, retention policies, export capabilities, and integrity verification for compliance.

**Inputs:** `enabled`, `events[]` (id, action, actor, timestamp, details, changes[] with field/oldValue/newValue), `retention` (duration, archiveAfter, storage), `export` (format: json/csv/parquet, schedule, destination), `integrity` (hashAlgorithm, signingEnabled, verifyOnRead).

**Outputs:** Immutable event log with field-level change tracking; exported audit data to configured destination.

**Dependencies:** WorkflowEvent (events recorded in audit), WorkflowConfiguration (logging settings), WorkflowMetrics (audit export metrics).

**Relationships:** WorkflowEvent (audited events), WorkflowConfiguration (controls audit level), WorkflowMetrics (audit log size, export counters).

**Lifecycle:** Event Occurred → Recorded → Archived → Exported → Purged (per retention).

**Future Extensions:** Add real-time audit stream and blockchain-based integrity verification.
