# Error Handling Guide

## Error Hierarchy

```
Error
├── StorynaramError (base)
│   ├── DomainError
│   │   ├── EntityNotFoundError
│   │   ├── EntityValidationError
│   │   └── BusinessRuleViolationError
│   ├── RuntimeError
│   │   ├── EngineInitializationError
│   │   ├── PluginLoadError
│   │   └── ConfigurationError
│   ├── ValidationError
│   │   ├── SchemaValidationError
│   │   ├── ConstraintViolationError
│   │   └── RuleExecutionError
│   ├── WorkflowError
│   │   ├── InvalidTransitionError
│   │   ├── StateNotFoundError
│   │   └── ApprovalRejectedError
│   ├── AIError
│   │   ├── ModelTimeoutError
│   │   ├── HallucinationDetectedError
│   │   └── TokenBudgetExceededError
│   ├── PluginError
│   │   ├── PluginLoadError
│   │   ├── PluginCrashError
│   │   └── PluginPermissionError
│   └── StorageError
│       ├── FileNotFoundError
│       └── UploadFailedError
├── ZodError (input validation)
└── AjvError (schema validation)
```

## Error Shape

```typescript
interface StorynaramErrorShape {
  code: string;            // Machine-readable code
  message: string;         // Human-readable message
  details?: unknown;       // Additional context
  stack?: string;          // Stack trace (development only)
  correlationId?: string;  // Tracing correlation
  timestamp: string;       // ISO 8601
}
```

## Recovery Strategies

| Strategy | Description | Applied To |
|----------|-------------|------------|
| retry | Retry with backoff | Transient failures (network, timeout) |
| fail-fast | Throw immediately | Validation, configuration errors |
| fallback | Use alternative | Model unavailability, storage failover |
| degrade | Disable feature | Plugin crash, non-critical engine |
| skip | Skip and continue | Non-critical validation warnings |
| compensate | Undo previous action | Failed workflow transitions |
| escalate | Notify admin | Security violations, critical errors |

## Global Exception Filter

```typescript
@Catch()
class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // 1. Log error with correlation ID
    // 2. Map to StorynaramErrorShape
    // 3. Apply recovery strategy
    // 4. Return standardized HTTP response
  }
}
```

## HTTP Error Mapping

| Error Type | HTTP Status | Code Prefix |
|------------|-------------|-------------|
| DomainError | 400/404 | DOM- |
| ValidationError | 422 | VAL- |
| WorkflowError | 409 | WF- |
| AIError | 503 | AI- |
| PluginError | 500 | PLG- |
| StorageError | 500 | STO- |
| AuthenticationError | 401 | AUTH- (future) |
| AuthorizationError | 403 | AUTH- (future) |
