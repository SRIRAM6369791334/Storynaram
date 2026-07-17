# Event Architecture

## Event Categories

| Category | Prefix | Example | Producer |
|----------|--------|---------|----------|
| Domain Events | entity | `entity.created`, `entity.updated` | Core services |
| System Events | system | `system.started`, `system.shutdown` | Runtime |
| Workflow Events | workflow | `workflow.transition`, `workflow.completed` | Workflow |
| AI Events | ai | `ai.generated`, `ai.validated` | AI engine |
| Validation Events | validation | `validation.passed`, `validation.failed` | Validation |
| Plugin Events | plugin | `plugin.loaded`, `plugin.error` | Plugin host |

## Event Schema

```typescript
interface DomainEvent<T = unknown> {
  id: string;           // Unique event ID
  type: string;         // Event type (dot-notation)
  version: number;      // Event schema version
  timestamp: string;    // ISO 8601
  source: string;       // Producer identifier
  correlationId: string;// Tracing correlation
  causationId: string;  // Causing event ID
  data: T;              // Event payload
  metadata?: Record<string, unknown>;
}
```

## Event Naming Convention

`{domain}.{entity}.{action}` — e.g.:
- `entity.character.created`
- `entity.book.published`
- `workflow.state.transitioned`
- `ai.prompt.generated`
- `validation.profile.executed`

## Event Lifecycle

1. **Emit** — Service calls EventBus.publish()
2. **Persist** — Event stored in event store (optional)
3. **Route** — Event bus routes to matching subscribers
4. **Process** — Subscriber handlers execute
5. **Acknowledge** — Handler signals success/failure
6. **Dead Letter** — Unhandled events go to DLQ

## Event Versioning

- Events are versioned independently
- Version encoded in event type: `entity.character.created.v1`
- Backward compatible changes: add optional fields
- Breaking changes: new event version, old version deprecated
- Consumers declare supported version ranges
- Event bus routes to appropriate version handlers

## Core Domain Events

| Event | Payload | Triggered By |
|-------|---------|-------------|
| entity.{type}.created | Entity document | Entity creation |
| entity.{type}.updated | Diff (before/after) | Entity update |
| entity.{type}.deleted | Entity ID | Entity deletion |
| entity.{type}.validated | ValidationResult | Schema validation |
| entity.{type}.published | Entity ID + version | Publishing action |
| entity.{type}.archived | Entity ID | Archiving action |

## System Events

| Event | Payload | Triggered By |
|-------|---------|-------------|
| system.bootstrap.started | — | App start |
| system.bootstrap.completed | Duration | App ready |
| system.shutdown.initiated | Reason | SIGTERM |
| system.shutdown.completed | Duration | Graceful stop |
| system.error | Error details | Unhandled error |
