# Workflow Framework — Best Practices

## State Machine Design

- **Keep states minimal** — No more than 8-10 states per workflow. Split complex workflows into sub-workflows.
- **Explicit initial and terminal states** — Every workflow must have exactly one initial state and at least one terminal state.
- **State metadata for permissions** — Use `isEditable`, `isPublishable`, `isDeletable` as permission gates, not separate logic.
- **Avoid state explosion** — If you need 20+ states, consider parallel sub-workflows or a state hierarchy.

## Transition Design

- **Every transition needs a guard** — Unless the transition is unconditional, always add a guard condition.
- **Log all transitions** — Enable audit logging for every transition. Missing transitions indicate bugs.
- **Auto-transitions for predictable flows** — If a state always leads to the same next state, use auto-transition with a delay.
- **Validate transitions at definition time** — Check that all transition sources and targets exist in the states list.

## Approval Design

- **Single approval for low-risk** — Draft reviews, non-critical edits.
- **Parallel for independence** — Multiple reviewers who work independently (e.g., technical + editorial).
- **Sequential for dependencies** — Each stage depends on the previous (e.g., legal → editorial → publishing).
- **AI pre-check before human** — Always run AI validation first. Only escalate to human if AI flags issues.
- **Auto-approve low-risk items** — Define auto-approval conditions to reduce bottlenecks.

## Retry and Error Handling

- **Exponential backoff** — Never use fixed retry delays. Multiply by 2x each attempt.
- **Dead letter queue** — Every queue must have a dead letter queue. Items that exceed max retries go to DLQ for manual inspection.
- **Rollback snapshots** — Create checkpoints at every state transition. This enables safe rollback to any prior state.

## Performance

- **Async actions** — Long-running actions (AI generation, export, import) should be async with progress tracking.
- **Queue monitoring** — Monitor queue depth and processing time. Alert on queue growth.
- **State history pruning** — Archive audit events older than 90 days to maintain query performance.
