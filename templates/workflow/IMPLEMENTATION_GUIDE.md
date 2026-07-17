# Workflow Framework — Implementation Guide

## Step 1: Define Workflow Type

Choose the workflow type from the predefined list or create a custom type.

## Step 2: Define States

```json
{
  "states": [
    { "name": "draft", "label": "Draft", "type": "initial", "metadata": { "isEditable": true } },
    { "name": "review", "label": "In Review", "type": "intermediate", "metadata": { "isEditable": false, "requiresReview": true } },
    { "name": "approved", "label": "Approved", "type": "final", "metadata": { "isPublishable": true } }
  ],
  "initialState": "draft",
  "terminalStates": ["approved"]
}
```

## Step 3: Define Transitions

```json
{
  "transitions": [
    { "id": "submit", "from": "draft", "to": "review", "type": "manual", "guard": "isComplete" },
    { "id": "approve", "from": "review", "to": "approved", "type": "manual" }
  ]
}
```

## Step 4: Configure Approval (if needed)

```json
{
  "approval": {
    "type": "single",
    "approvers": [{ "role": "editor", "count": 1 }],
    "escalation": { "afterHours": 24, "escalateTo": "senior-editor" }
  }
}
```

## Step 5: Add Events and Notifications

```json
{
  "events": [
    { "type": "workflowStarted", "producer": "workflow-engine" },
    { "type": "workflowCompleted", "producer": "workflow-engine" }
  ],
  "notification": {
    "channels": ["in-app", "email"],
    "triggers": ["on-transition", "on-failure"]
  }
}
```

## Step 6: Configure Resilience

```json
{
  "checkpoints": { "createOnTransition": true },
  "retry": { "maxRetries": 3, "retryDelay": 60, "backoffMultiplier": 2 },
  "rollback": { "enabled": true, "strategy": "snapshot" }
}
```

## Integration with Entity Lifecycle

The workflow framework integrates with entity lifecycle via `BaseLifecycle`:

| BaseLifecycle Field | Workflow Mapping |
|--------------------|------------------|
| `currentState` | Current workflow state |
| `states` | WorkflowState definitions |
| `transitions` | WorkflowTransition definitions |
| `history` | WorkflowAudit events |
