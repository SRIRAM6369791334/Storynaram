# Workflow Template Framework

## Purpose

Reusable workflow templates that orchestrate every Storynaram process — state machines, business processes, AI orchestration, human review, publishing, validation, approval, automation, background jobs, and event-driven workflows.

## Design Principles

- **State machine foundation** — All workflows are built on explicit state machines
- **Event-driven** — Workflows react to events and emit events
- **Composable** — Workflows compose states, transitions, triggers, and actions
- **Observable** — Every workflow has built-in audit and metrics
- **Resilient** — Checkpoints, rollback, retry, and error handling built in

## Templates

| # | Template | Purpose |
|---|----------|---------|
| 1 | [Workflow](Workflow.template.json) | Root workflow — composes all other workflow blocks |
| 2 | [WorkflowState](WorkflowState.template.json) | State definitions with metadata, entry/exit actions |
| 3 | [WorkflowTransition](WorkflowTransition.template.json) | State transitions with guards, triggers, actions |
| 4 | [WorkflowTrigger](WorkflowTrigger.template.json) | Trigger definitions — manual, auto, AI, time, event, rule |
| 5 | [WorkflowCondition](WorkflowCondition.template.json) | Guard conditions and invariants |
| 6 | [WorkflowAction](WorkflowAction.template.json) | Action definitions — system, AI, notification, webhook |
| 7 | [WorkflowApproval](WorkflowApproval.template.json) | Approval chains — single, multi-stage, parallel, hybrid |
| 8 | [WorkflowReview](WorkflowReview.template.json) | Review processes — peer, editorial, AI |
| 9 | [WorkflowAssignment](WorkflowAssignment.template.json) | Task/user assignment with routing |
| 10 | [WorkflowNotification](WorkflowNotification.template.json) | Notification channels and templates |
| 11 | [WorkflowEvent](WorkflowEvent.template.json) | Event definitions and routing |
| 12 | [WorkflowCheckpoint](WorkflowCheckpoint.template.json) | Savepoint snapshots for rollback |
| 13 | [WorkflowRollback](WorkflowRollback.template.json) | Rollback strategies — sequential, snapshot, compensating |
| 14 | [WorkflowRetry](WorkflowRetry.template.json) | Retry policies with backoff |
| 15 | [WorkflowSchedule](WorkflowSchedule.template.json) | Cron-based scheduling |
| 16 | [WorkflowTimer](WorkflowTimer.template.json) | Timer definitions — delay, interval, timeout |
| 17 | [WorkflowQueue](WorkflowQueue.template.json) | Queue configuration with dead letter queue |
| 18 | [WorkflowAudit](WorkflowAudit.template.json) | Audit trail with integrity checking |
| 19 | [WorkflowMetrics](WorkflowMetrics.template.json) | Performance metrics and counters |
| 20 | [WorkflowConfiguration](WorkflowConfiguration.template.json) | Root configuration with feature flags |

## Predefined Workflow Types

| Workflow | Description |
|----------|-------------|
| Character Lifecycle | draft → planning → writing → review → approved → published → archived |
| Book Lifecycle | outline → drafting → editing → review → approved → published |
| Chapter Lifecycle | planned → drafted → revised → reviewed → final |
| Scene Lifecycle | outlined → written → revised → reviewed → locked |
| Timeline Management | proposed → reviewed → approved → canon → archived |
| Canon Review | submitted → ai-check → human-review → approved → canonized |
| AI Content Generation | planned → context-collected → generated → verified → quality-checked → published |
| Publishing | prepared → proofread → formatted → approved → published |
| Import | uploaded → validated → mapped → imported → verified |
| Export | selected → transformed → packaged → delivered → confirmed |
| Translation | source → segmented → translated → reviewed → approved → published |
