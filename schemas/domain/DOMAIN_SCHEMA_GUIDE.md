# Domain Schema Guide

## Schema Pattern

Every domain schema follows this pattern:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storynaram.dev/schemas/domain/{Name}.schema.json",
  "title": "{Name}",
  "type": "object",
  "allOf": [{ "$ref": "../core/BaseEntity.schema.json" }],
  "properties": {
    "entity": {
      "type": "object",
      "description": "{Name}-specific fields",
      "required": [...],
      "properties": { ... }
    }
  },
  "unevaluatedProperties": false
}
```

## Key Design Rules

1. **allOf with BaseEntity** — Every schema references BaseEntity via allOf. This brings in all core fields (identifier, metadata, audit, version, status, etc.)
2. **Entity block** — Domain-specific fields live under `entity`. Never pollute the root level with domain fields.
3. **unevaluatedProperties: false** — Prevents unexpected fields at the root level. Entity block has its own validation.
4. **No core duplication** — Never redefine identifier, metadata, audit, or any other core field.

## Entity Field Design

- Use `enum` for constrained value sets (narrativeRole, pointOfView, item category)
- Use `pattern` for formatted strings (IDs, dates)
- Use `minimum`/`maximum` for numeric bounds
- Use `array` with `items: { "type": "string" }` for reference lists
- Use nested `object` for grouped fields (appearance, personality, series)

## Cross-Entity References

Entity reference fields (characterIds, locationId, bookId) are typed as strings. In a future phase, these may be constrained with pattern matching or $ref to specific entity schemas.

## Migration from Template to Schema

| Template | Schema |
|----------|--------|
| `required` in properties | Same |
| `enum` in properties | Same |
| `pattern` in properties | Same |
| Entity-specific object | Moved under `entity` property |
| Base fields | Removed — inherited via allOf |
