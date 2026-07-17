# AI Schema Guide

## Schema Pattern

Every AI schema follows this pattern:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storynaram.dev/schemas/ai/{Name}.schema.json",
  "title": "{Name}",
  "type": "object",
  "$defs": { ... },
  "properties": { ... },
  "unevaluatedProperties": false
}
```

## Key Design Rules

1. **Standalone schemas** — AI schemas do NOT extend BaseEntity. They represent runtime state and configuration, not narrative entities.
2. **All properties optional** — Every AI schema root property is optional. This allows partial configuration and progressive enhancement.
3. **$defs for reuse** — Complex sub-objects are defined as `$defs` and referenced via `$ref`. This avoids duplication and enables independent evolution.
4. **Enum constraints** — All constrained value sets use `enum` for compile-time validation.
5. **Model-agnostic** — No vendor-specific fields. No OpenAI, Anthropic, Google, or other provider-specific properties.

## Property Design

- Use `"default"` for common defaults (retrieval enabled: true, chunk size: 512, etc.)
- Use `"minimum"`/`"maximum"` for numeric bounds (temperature 0-2, dimensions 64-8192, importance 0-100)
- Use `"format": "date-time"` for all timestamps
- Use `"pattern": "^\\d+\\.\\d+\\.\\d+$"` for semver version strings
- Use `"additionalProperties": true` only for extensible maps (pluginContext, workingMemory, perParticipant)

## No Core Schema Reuse

Unlike domain schemas, AI schemas do NOT reference BaseEntity or any core schema. This is intentional:

- Core schemas define persistent narrative entity state
- AI schemas define ephemeral runtime configuration and execution state
- Cross-cutting AI metadata on entities is handled by BaseAI.schema.json (in core schemas), which is referenced via BaseEntity.ai

## Validation Strategy

- Use `if/then/else` for conditional validation where applicable
- Use `dependentSchemas` for related field pairs
- All numeric fields bounded with min/max
- All string enums exhaustive
