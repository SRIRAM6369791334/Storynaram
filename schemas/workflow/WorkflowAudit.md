# WorkflowAudit

**File:** `WorkflowAudit.schema.json`

**Purpose:** Captures detailed audit trail of workflow changes, including field-level diffs, actor attribution, retention policies, and integrity verification.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowAudit.template.json`

**Required Properties:** none

**Key Enums:** storage (`database`, `file`, `object-store`, `cold-storage`); export format (`json`, `csv`, `parquet`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false on all object definitions; integrity config supports hash verification (`sha256` default) and optional signing.
