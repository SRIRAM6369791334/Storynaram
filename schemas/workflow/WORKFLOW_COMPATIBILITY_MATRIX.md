# Workflow Compatibility Matrix

## Schema Version Compatibility

| Schema | v1.0 | v1.1 | v2.0 |
|--------|------|------|------|
| Workflow | ✓ | ✓ | ✓ |
| WorkflowState | ✓ | ✓ | ✓ |
| WorkflowTransition | ✓ | ✓ | ✓ |
| WorkflowTrigger | ✓ | ✓ | ✓ |
| WorkflowCondition | ✓ | ✓ | ✓ |
| WorkflowAction | ✓ | ✓ | ✓ |
| WorkflowApproval | ✓ | ✓ | ✓ |
| WorkflowReview | ✓ | ✓ | ✓ |
| WorkflowAssignment | ✓ | ✓ | ✓ |
| WorkflowNotification | ✓ | ✓ | ✓ |
| WorkflowEvent | ✓ | ✓ | ✓ |
| WorkflowCheckpoint | ✓ | ✓ | ✓ |
| WorkflowRollback | ✓ | ✓ | ✓ |
| WorkflowRetry | ✓ | ✓ | ✓ |
| WorkflowSchedule | ✓ | ✓ | ✓ |
| WorkflowTimer | ✓ | ✓ | ✓ |
| WorkflowQueue | ✓ | ✓ | ✓ |
| WorkflowAudit | ✓ | ✓ | ✓ |
| WorkflowMetrics | ✓ | ✓ | ✓ |
| WorkflowConfiguration | ✓ | ✓ | ✓ |

## Validator Compatibility

| Validator | Draft 2020-12 | Format Assertion | $ref Resolution |
|-----------|:---:|:---:|:---:|
| Ajv 8.x | ✓ | ✓ | ✓ |
| Hyperjump 1.x | ✓ | ✓ | ✓ |
| Everitt 1.x | ✓ | ~ | ✓ |
| JSON Schema CLI | ✓ | ✓ | ✓ |

## Engine Compatibility

| Engine Feature | WorkflowSchema Requirement | Min Engine Version |
|----------------|---------------------------|-------------------|
| State machine execution | WorkflowState + WorkflowTransition | v2.0.0 |
| Approval routing | WorkflowApproval | v2.0.0 |
| Review workflows | WorkflowReview | v2.0.0 |
| Auto-notifications | WorkflowNotification | v2.1.0 |
| Retry policies | WorkflowRetry | v2.0.0 |
| Scheduling | WorkflowSchedule | v2.1.0 |
| Audit logging | WorkflowAudit | v2.0.0 |
| Metrics export | WorkflowMetrics | v2.1.0 |
| Queue management | WorkflowQueue | v2.0.0 |
| Rollback | WorkflowRollback | v2.1.0 |
| Checkpoint recovery | WorkflowCheckpoint | v2.1.0 |
