# Logging Guide

## Logging Strategy

- **Format:** Structured JSON via Pino
- **Levels:** trace, debug, info, warn, error, fatal
- **Development:** Pretty-printed via pino-pretty
- **Production:** JSON to stdout (container-native)
- **Testing:** Pino noop/test sink

## Correlation ID

Every request/operation gets a correlation ID:

```typescript
// Set at request boundary
const correlationId = randomUUID();
AsyncLocalStorage.enterWith({ correlationId });

// Available throughout request lifecycle
logger.info({ msg: 'Processing entity', entityId });
// Output: {"correlationId":"abc-123","msg":"Processing entity",...}
```

## Log Enrichment

Every log entry includes:
- `correlationId` — Trace across services
- `service` — Service name (`@storynaram/api`)
- `version` — Application version
- `environment` — nodeEnv
- `timestamp` — ISO 8601
- `level` — Log level number

Contextual enrichment:
- `entityId`, `entityType` — Entity operations
- `workflowId` — Workflow operations
- `sessionId` — Session operations
- `pluginId` — Plugin operations

## Logging Best Practices

1. **Never log secrets** — API keys, tokens, passwords filtered
2. **Structured data** — Use context objects, not string interpolation
3. **Appropriate levels** — info for business events, debug for internals
4. **Correlation always** — Every log linked to a trace
5. **No console.log** — Always use injected logger
6. **Error objects** — Include error code, stack, correlationId

## Logger Interface

```typescript
interface Logger {
  trace(msg: string, ctx?: LogContext): void;
  debug(msg: string, ctx?: LogContext): void;
  info(msg: string, ctx?: LogContext): void;
  warn(msg: string, ctx?: LogContext): void;
  error(msg: string, ctx?: LogContext): void;
  fatal(msg: string, ctx?: LogContext): void;
  child(bindings: Record<string, unknown>): Logger;
}
```

## Audit Logging

Critical operations logged to audit trail:
- Entity create/update/delete
- Approval actions
- Configuration changes
- Permission changes
- Plugin load/unload
- Workflow transitions

Audit logs include: actor, action, resource, timestamp, before/after state.
