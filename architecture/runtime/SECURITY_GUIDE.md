# Security Architecture

## Authentication (Future)

**Strategy:** JWT-based with optional OAuth2/OIDC providers
**Implementation:** Passport.js strategies via @nestjs/passport

- JWT access tokens (short-lived, 15 min)
- Refresh tokens (long-lived, 7 days)
- API key authentication for service-to-service
- Session management (future: Redis-backed)

## Authorization (Future)

**Strategy:** Role-Based Access Control (RBAC) + Attribute-Based Access Control (ABAC)

- Roles: admin, editor, author, reviewer, reader
- Permissions: resource-based (`entity:read`, `entity:write`, `workflow:execute`)
- Resource ownership: Owner access, group access, public access
- Plugin permissions: declared in manifest, enforced at runtime

## Input Validation

| Boundary | Validator | Strategy |
|----------|-----------|----------|
| HTTP Body | Zod | Zod schemas from OpenAPI |
| HTTP Params | Zod | Type coercion + validation |
| HTTP Query | Zod | Type coercion + validation |
| Entity data | AJV | JSON Schema Draft 2020-12 |
| Configuration | AJV | Config schema at startup |
| Plugin input | Zod | Plugin SDK schemas |

## Output Validation

- API responses validated against OpenAPI schemas (future)
- Entity data validated against domain schemas before response
- AI output validated against AI validation profile
- Workflow state validated against state definition

## Secrets Handling

- Secrets never logged, never in error messages
- Dev: .env.local (gitignored)
- Production: Secrets manager
- API keys masked in config output
- Database credentials rotated automatically

## Plugin Security

| Risk | Mitigation |
|------|------------|
| Malicious plugin | Permission declaration, sandbox execution |
| Plugin crash | Isolated error boundary |
| Resource exhaustion | CPU/memory/network limits |
| Data exfiltration | Read-only unless permission granted |
| Supply chain | Locked dependencies, SBOM generation |

## HTTP Security Headers

```typescript
// Applied via helmet middleware
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: true,
  xssFilter: true,
}));
```
