# Validation Rule Guide

## Rule Scopes

| Scope | Description |
|-------|-------------|
| field | Single field validation (required, format, pattern) |
| entity | Whole entity validation (cross-field dependencies) |
| cross-entity | Validation across multiple entities (reference integrity) |
| workflow | State machine and transition validation |
| ai | AI output validation (hallucination, canon) |
| security | Security and access control validation |
| canon | Canon consistency and contradiction checks |
| reference | Reference integrity and orphan detection |
| relationship | Relationship cardinality and symmetry |
| plugin | Plugin integrity and compatibility |
| version | Semver and migration validation |
| migration | Data migration validation |

## Rule Categories

| Category | Description | Example |
|----------|-------------|---------|
| required | Field must be present | identifier.id |
| format | Field must match format | email format |
| enum | Field must be in allowed set | status enum |
| length | String/array length constraints | min/max length |
| range | Numeric range constraints | value 0-100 |
| pattern | Regex pattern match | ID format |
| reference | Reference exists and valid | entity ID resolution |
| unique | Field value is unique | title uniqueness |
| business | Domain business rule | character age > parent age |
| integrity | Structural integrity | no circular references |
| custom | Plugin-defined rule | custom validator |

## Example: Creating a Validation Rule

```json
{
  "ruleId": "vr_char_000001",
  "name": "character-age-range",
  "scope": "field",
  "severity": "high",
  "category": "range",
  "field": "entity.appearance.age",
  "condition": "age >= 0 && age <= 9999",
  "params": { "min": 0, "max": 9999 },
  "message": "Character age must be between 0 and 9999",
  "errorCode": "ERR-AGE-OUT-OF-RANGE",
  "recovery": "manual-fix",
  "enabled": true
}
```

## Example: Creating a Business Rule

```json
{
  "ruleId": "br_world_000001",
  "name": "world-must-have-locations",
  "domain": "world-building",
  "expression": "entity.locations.size() > 0",
  "severity": "high",
  "category": "business",
  "scope": "entity",
  "enabled": true
}
```
