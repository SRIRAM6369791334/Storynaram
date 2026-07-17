# Testing Guide

## Testing Pyramid

```
         ╱╲
        ╱ E2E ╲           Playwright (few)
       ╱━━━━━━━╲
      ╱Integration╲        Supertest + test DB (some)
     ╱━━━━━━━━━━━━━╲
    ╱   Unit Tests   ╲     Vitest (many)
   ╱━━━━━━━━━━━━━━━━━━╲
  ╱  Schema Validation  ╲   AJV + fixtures (foundation)
 ╱━━━━━━━━━━━━━━━━━━━━━━━╲
```

## Testing Architecture

### Unit Tests (Vitest)

- Test services, utilities, domain logic in isolation
- Mock all external dependencies
- One test file per source file: `{name}.spec.ts`
- Coverage target: 90%+ for domain logic, 80%+ overall

### Integration Tests (Vitest + Supertest)

- Test NestJS modules with real DI
- Test against test database (PostgreSQL test container)
- Test against Redis mock/container
- Test full request → response cycle
- One test file per endpoint group

### Schema Validation Tests

- Load each JSON Schema
- Test with valid example documents
- Test with invalid documents
- Test $ref resolution
- Test unevaluatedProperties enforcement
- Test enum values

### Contract Tests

- Validate OpenAPI spec against schema definitions
- Verify request/response shapes match schemas
- Test backward compatibility of API changes

### Plugin Tests

- Load plugin in isolated Node.js process
- Test plugin lifecycle hooks
- Test plugin capabilities
- Test plugin error handling
- Test plugin permission enforcement

### E2E Tests (Playwright)

- Full system test: API → Services → Database → Response
- Cross-module workflows
- Error scenarios
- Performance baselines
- Critical path coverage only

## Test Infrastructure

```typescript
// Global test setup
beforeAll(async () => {
  // Start PostgreSQL test container
  // Load fixture data
  // Initialize NestJS test module
});

afterAll(async () => {
  // Stop containers
  // Cleanup
});
```

## Testing Tools

| Concern | Tool |
|---------|------|
| Test runner | Vitest |
| Assertions | Vitest built-in |
| Mocking | vitest.mock |
| HTTP testing | Supertest |
| E2E | Playwright |
| Test containers | Testcontainers for Node.js |
| Fixtures | JSON Schema valid fixtures |
| Code coverage | c8 (via Vitest) |
