# Workflow Schema Guide

## Schema Pattern

Every workflow schema follows this pattern:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storynaram.dev/schemas/workflow/{Name}.schema.json",
  "title": "{Name}",
  "type": "object",
  "$defs": { ... },
  "properties": { ... },
  "unevaluatedProperties": false
}
```

## Composite Root Pattern

`Workflow.schema.json` is the composite root. It references all other workflow schemas via `$ref`:

```json
{
  "properties": {
    "states": { "$ref": "WorkflowState.schema.json" },
    "transitions": { "$ref": "WorkflowTransition.schema.json" },
    "approval": { "$ref": "WorkflowApproval.schema.json" },
    ...
  }
}
```

This enables a complete workflow definition in a single validated document while keeping each concern independently schema-validatable.

## State Machine Design

The workflow state machine is defined by three cooperating schemas:

| Schema | Role |
|--------|------|
| WorkflowState | Defines valid states and their metadata |
| WorkflowTransition | Defines allowed transitions with guards |
| WorkflowTrigger | Defines what initiates transitions |

State types:
- **initial** — Entry point (exactly one)
- **intermediate** — Processing states
- **final** — Successful completion states
- **error** — Failure states
- **terminal** — Absorbing states (no outgoing transitions)

## Validation Rules

- `from` and `to` in transitions must reference defined state names
- Trigger `type` determines which trigger-specific fields apply (cron for time-based, event for event-based)
- Required approval count must not exceed total approvers
- Schedule constraints use type-specific value parsing
- Checkpoint storage determines persistence medium
- Metrics export interval must be positive
- Token allocation sums should not exceed maxContextTokens (cross-schema)
