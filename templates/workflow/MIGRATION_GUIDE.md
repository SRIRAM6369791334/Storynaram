# Workflow Framework — Migration Guide

## Migrating from Manual Lifecycle

If entities currently have ad-hoc status fields:

| Legacy Pattern | Workflow Replacement |
|----------------|---------------------|
| `status: "draft"` | WorkflowState with state `draft` |
| Manual status changes | WorkflowTransition with guards |
| Email notifications | WorkflowNotification |
| Human approval emails | WorkflowApproval |
| Manual archiving | WorkflowSchedule + WorkflowTransition |

## Migration Steps

### Step 1: Map Status to State Machine

```json
{
  "states": [
    { "name": "draft", "type": "initial" },
    { "name": "active", "type": "intermediate" },
    { "name": "archived", "type": "terminal" }
  ]
}
```

### Step 2: Create Transitions

Map existing status changes to formal transitions.

### Step 3: Add Checkpoints

Enable checkpoint creation to support rollback from day one.

### Step 4: Configure Notifications

Replace ad-hoc email logic with WorkflowNotification templates.

### Step 5: Add Audit Trail

Enable WorkflowAudit to capture all state changes retroactively where possible.

## Template Versioning

| Change | Impact |
|--------|--------|
| New state added | Low — existing transitions unaffected |
| State removed | High — all transitions to/from must be remapped |
| New transition added | Low — new capability |
| Approval type changed | Medium — existing approval records may need migration |
| Checkpoint format changed | High — rollback compatibility broken |
