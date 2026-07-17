# WorkflowAction

**File:** `WorkflowAction.schema.json`

**Purpose:** Defines executable actions within a workflow, supporting system, AI, notification, validation, and custom plugin actions.

**Type:** Standalone Workflow Schema

**Template Source:** `templates/workflow/WorkflowAction.template.json`

**Required Properties:** none (the `actions` array is optional)

**Key Enums:** type (`system`, `notification`, `ai`, `validation`, `export`, `import`, `transform`, `webhook`, `plugin`, `custom`); onFailure (`abort`, `skip`, `retry`, `continue`)

**Referenced by:** Workflow.schema.json

**Validation Notes:** `unevaluatedProperties` is false at the top level; each `ActionDefinition` allows arbitrary `config` via `additionalProperties`.
