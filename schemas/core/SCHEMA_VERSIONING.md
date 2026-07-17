# Schema Versioning

## Version Strategy

All schemas follow semantic versioning (MAJOR.MINOR.PATCH) embedded in the `$id` URL path.

## Version Location

The `$id` URL includes the version:
```
https://storynaram.dev/schemas/core/v1/BaseIdentifier.schema.json
```

For the initial release, `$id` omits the version path. Future versions will add it:
```
https://storynaram.dev/schemas/core/v2/BaseIdentifier.schema.json
```

## Version Rules

| Change | Version Bump | Example |
|--------|-------------|---------|
| New optional field | MINOR | Adding `displayId` to BaseIdentifier |
| New required field | MAJOR | Adding `namespace` as required |
| Field type change | MAJOR | `sequence` from string to integer |
| Constraint relaxed | MINOR | maxLength increased |
| Constraint tightened | MAJOR | pattern made more restrictive |
| Enum value added | MINOR | New visibility level |
| Enum value removed | MAJOR | Visibility level removed |
| New optional schema | MINOR | New BaseXxx.schema.json added |
| Schema removed | MAJOR | Schema deprecated and removed |

## Schema Resolution

Entities declare their schema version in the `$schema` field:
```json
{ "$schema": "https://storynaram.dev/schemas/core/v1/BaseEntity.schema.json" }
```

The composition engine resolves `$ref` relative to the base URL.

## Compatibility

| Compatibility Level | Meaning | Version Constraint |
|--------------------|---------|-------------------|
| Forward | Old reader, new document | Same MAJOR |
| Backward | New reader, old document | Same MAJOR |
| Breaking | Structural change | MAJOR bump required |

## Deprecation

1. Schema marked deprecated in documentation
2. Deprecation warning emitted during validation
3. Schema removed after 2 MAJOR versions
4. Migration path documented in SCHEMA_MIGRATION.md
