# Schema Design Guide

## Principles

1. **1:1 mapping to templates** — Every Base Template (Phase 2.1) maps to exactly one JSON Schema file
2. **Composition via $ref** — Use `$ref` to compose schemas, never duplicate field definitions
3. **Required only when essential** — Only fields that must always be present are `required`
4. **Patterns over ad-hoc** — Use pattern constraints instead of verbose enum lists where possible
5. **Format for semantics** — Use `format: date-time` and `format: uri` for typed values

## Draft 2020-12 Features Used

| Feature | Usage |
|---------|-------|
| `$id` | Unique schema identifier with version path |
| `$ref` | Cross-schema references, never duplicate definitions |
| `allOf` | BaseEntity composition of required blocks |
| `pattern` | String format constraints (IDs, versions, locale codes) |
| `enum` | Fixed value sets (visibility levels, status values) |
| `format` | Date-time, URI validation |
| `required` | Mandatory field declarations |

## Naming Conventions

- File name: `{Name}.schema.json` (PascalCase, matching template name)
- Schema title: Same as file name
- `$id`: `https://storynaram.dev/schemas/core/{Name}.schema.json`
- Property names: camelCase

## Validation Categories

| Category | Schema Feature | Example |
|----------|---------------|---------|
| Presence | `required` | id, prefix, sequence, type |
| Format | `pattern` | `^[a-z]+_[0-9]{6,}$` |
| Type | `type` | string, integer, boolean |
| Range | `minimum`/`maximum` | priority 0-100 |
| Enum | `enum` | visibility levels |
| Length | `minLength`/`maxLength` | title 1-256 |
| Reference | `$ref` | Cross-schema composition |
