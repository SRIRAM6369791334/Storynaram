# Schema Review Process

Every schema change must pass through a defined review pipeline before being merged. The pipeline enforces correctness, consistency, and cross-schema integrity.

## Review Pipeline

```
                   ┌─────────────────┐
                   │  Pre-commit      │
                   │  (Automated)     │
                   └────────┬────────┘
                            ↓
                   ┌─────────────────┐
                   │  Peer Review     │
                   │  (Human)         │
                   └────────┬────────┘
                            ↓
                   ┌─────────────────┐
                   │  Architecture    │
                   │  Review          │
                   └────────┬────────┘
                            ↓
                   ┌─────────────────┐
                   │  Security        │
                   │  Review          │
                   └────────┬────────┘
                            ↓
                   ┌─────────────────┐
                   │  Final Approval  │
                   │  (Schema Owner)  │
                   └────────┬────────┘
                            ↓
                   ┌─────────────────┐
                   │  Post-commit     │
                   │  (Automated)     │
                   └─────────────────┘
```

## Stage Details

### Pre-commit (Automated)

Run by the CI pipeline on every pull request touching schema files.

| Check | Tool | Failure Action |
|-------|------|---------------|
| Draft 2020-12 compliance | JSON Schema validator | Block merge |
| All `$ref` targets resolve | Reference checker | Block merge |
| No circular dependencies | Dependency analyzer | Block merge |
| No schema structural errors | Linter | Block merge |
| Naming convention compliance | Linter | Warn |

### Peer Review (Human)

At least one Schema Steward from a **different category** must review.

| Criteria | Focus |
|----------|-------|
| Schema structure | Is the schema well-organized? Are `$defs` used appropriately? |
| Naming conventions | Do names follow SCHEMA_NAMING_STANDARD.md? |
| Consistency | Does the schema follow patterns established by peer schemas? |
| Completeness | Are all required fields documented? Are descriptions clear? |
| Test examples | Do provided examples validate against the schema? |

### Architecture Review (Human)

The Schema Owner or designated architect assesses:

| Criteria | Focus |
|----------|-------|
| Cross-schema impact | Does this change affect schemas in other categories? |
| Dependency analysis | Are new dependencies justified? Any dependency cycles introduced? |
| Compatibility | Is backward compatibility maintained? Is the version bump correct? |
| Design alignment | Does the change align with the overall schema architecture? |

### Security Review (Human)

Required when the schema involves sensitive data.

| Criteria | Focus |
|----------|-------|
| Data classification | Is data sensitivity correctly classified? |
| Access patterns | Are access control considerations documented? |
| Exposure | Does the schema expose internal implementation details? |
| PII | Does the schema handle personally identifiable information? |

### Final Approval

The Schema Owner provides final sign-off:

- All automated checks pass
- All peer review comments resolved
- Architecture review completed (or waived)
- Security review completed (or waived)
- Version bump correct
- Registry entry accurate

### Post-commit (Automated)

After merge:

| Action | Tool |
|--------|------|
| Registry validation | Registry checker |
| Compatibility matrix validation | Compatibility analyzer |
| Consumer notification | Notification system |
| Release note entry | Release note generator |

## Review Exemptions

| Change Type | Pre-commit | Peer | Architecture | Security | Final |
|-------------|:----------:|:----:|:------------:|:--------:|:-----:|
| PATCH (typo/docs) | ✓ | — | — | — | — |
| PATCH (structural fix) | ✓ | ✓ | — | — | ✓ |
| MINOR | ✓ | ✓ | ✓ | (if needed) | ✓ |
| MAJOR | ✓ | ✓ | ✓ | ✓ | ✓ |
| New schema (draft) | ✓ | ✓ | — | — | ✓ |
| New schema (stable) | ✓ | ✓ | ✓ | ✓ | ✓ |

## Review SLAs

| Stage | Target Time |
|-------|------------|
| Pre-commit | < 2 minutes (automated) |
| Peer review | < 2 business days |
| Architecture review | < 3 business days |
| Security review | < 5 business days |
| Final approval | < 1 business day |
| Post-commit | < 5 minutes (automated) |
