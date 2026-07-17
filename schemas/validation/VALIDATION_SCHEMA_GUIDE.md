# Validation Schema Guide

## Schema Pattern

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storynaram.dev/schemas/validation/{Name}.schema.json",
  "title": "{Name}",
  "type": "object",
  "$defs": { ... },
  "properties": { ... },
  "unevaluatedProperties": false
}
```

## Severity Model

| Severity | Behavior | Example |
|----------|----------|---------|
| critical | Blocks execution | Security violation, data corruption |
| high | Blocks operation | Missing required field, invalid reference |
| medium | Requires attention | Enum mismatch, format deviation |
| low | Informational | Style suggestion, naming convention |
| info | Non-blocking | Deprecation notice, optimization hint |

## Recovery Strategies

| Strategy | Description |
|----------|-------------|
| auto-fix | Engine can automatically correct |
| manual-fix | Human intervention required |
| skip | Rule is skipped for this entity |
| abort | Entire operation is aborted |
| flag | Flagged for review, no action taken |

## Validation Domains

| Domain | Schemas |
|--------|---------|
| Field-level | ValidationRule, ValidationConstraint, BusinessRule |
| Entity-level | ValidationProfile, ValidationResult |
| Reference | ReferenceIntegrity, RelationshipIntegrity |
| Canon | CanonIntegrity |
| Workflow | WorkflowValidation |
| AI | AIValidationProfile |
| Security | SecurityValidation, PermissionValidation |
| Version | VersionValidation, MigrationValidation, CompatibilityValidation |
| Extension | ExtensionValidation, PluginValidation |
| Integration | IntegrationProfile |
