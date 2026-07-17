# Schema Best Practices

## Field Definitions

- **Always provide descriptions** — Every property needs a description. Future developers won't know what `legacyIds` means without it.
- **Use patterns for IDs** — Entity IDs always have the format `{prefix}_{sequence}`. Enforce with pattern constraints.
- **Prefer integers for ranks** — Priority, importance, and scores should be integers with min/max rather than strings.
- **Use enum for fixed sets** — Visibility levels, relationship types, and status values should be enums.
- **Format for dates** — Always use `format: date-time` for timestamps. Never use plain strings.

## Schema Organization

- **One concept per file** — Don't combine unrelated fields into a single schema.
- **Flat properties** — Prefer flat property lists over deeply nested objects unless grouping is semantically meaningful.
- **No circular $ref** — Avoid circular references between schemas. BaseEntity references all schemas, but schemas should not reference BaseEntity.
- **$defs for reuse** — Use `$defs` for complex types that repeat within a single schema. Use `$ref` for types shared across schemas.

## Validation

- **Required only when mandatory** — A field should only be `required` if the entity is non-functional without it.
- **Constraints document intent** — A maxLength of 256 on title documents a design decision. Include a comment explaining why.
- **Don't over-constrain** — Leave room for evolution. A maxLength of 256 is better than 50.

## Compatibility

- **Never remove a field without deprecation** — Mark as deprecated, keep it for 2 versions, then remove.
- **Never make optional → required** — This is always a MAJOR breaking change.
- **Enum additions are safe** — Adding a new enum value is MINOR. Removing one is MAJOR.
