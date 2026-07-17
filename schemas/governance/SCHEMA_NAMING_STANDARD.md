# Schema Naming Standard

This document defines naming conventions for all Storynaram schema files, identifiers, and properties.

## Schema File Names

### Pattern

```
{Category}{Entity}.schema.json
```

For schemas in the Core category, the category prefix is included for disambiguation:

```
Core{Entity}.schema.json
```

For schemas in domain categories (Entity, State, Narrative, Media), the category prefix is omitted:

```
{Entity}.schema.json
```

### Examples

| Category | File Name | Description |
|----------|-----------|-------------|
| Core | `BaseEntity.schema.json` | Base entity definition |
| Core | `CoreMetadata.schema.json` | Core metadata properties |
| Entity | `Character.schema.json` | Character entity |
| Entity | `Item.schema.json` | Item entity |
| State | `StateMachine.schema.json` | State machine definition |
| State | `Transition.schema.json` | State transition |
| Narrative | `Beat.schema.json` | Narrative beat |
| Narrative | `Act.schema.json` | Narrative act |
| Media | `Sprite.schema.json` | Sprite asset |
| Media | `Animation.schema.json` | Animation definition |

### Rules

- PascalCase: Each word starts with an uppercase letter, no separators
- Descriptive: The name should clearly describe the schema's content
- Singular: Always use singular form (`Character`, not `Characters`)
- No abbreviations unless universally understood (`Id`, `Uri`, `Json`)

## `$id` URI Pattern

```
https://storynaram.dev/schemas/{category}/{Name}.schema.json
```

Where `{category}` is one of: `core`, `entity`, `state`, `narrative`, `media`.

### Examples

```
https://storynaram.dev/schemas/core/BaseEntity.schema.json
https://storynaram.dev/schemas/entity/Character.schema.json
https://storynaram.dev/schemas/state/StateMachine.schema.json
https://storynaram.dev/schemas/narrative/Beat.schema.json
https://storynaram.dev/schemas/media/Sprite.schema.json
```

## `$defs` Naming

### Pattern

```
PascalCase, singular
```

### Examples

| Correct | Incorrect |
|---------|-----------|
| `TransitionDefinition` | `TransitionDefinitions` |
| `CoordinatePair` | `coordinate_pair` |
| `AnimationFrame` | `AnimationFrameDefinition` |

### Rules

- PascalCase
- Singular
- Descriptive noun or noun phrase
- Avoid redundant suffixes like `Definition`, `Type`, `Schema` unless needed for disambiguation

## Property Naming

### Pattern

```
camelCase
```

### Examples

| Correct | Incorrect |
|---------|-----------|
| `entityId` | `EntityId` |
| `maxRetries` | `max_retries` |
| `currentState` | `current-state` |
| `createdAt` | `created_at` |

### Rules

- camelCase: first word lowercase, subsequent words capitalized
- No underscores or hyphens
- Acronyms follow camelCase rules (`entityId`, not `entityID`; `jsonSchema`, not `JSONSchema`)
- Boolean properties should use positive form (`enabled`, not `disabled`; `visible`, not `hidden`)
- Array properties should use plural form (`tags`, `items`)

## Enum Values

### Pattern

```
kebab-case for multi-word values
Single word: lowercase
```

### Examples

| Category | Values |
|----------|--------|
| Reasoning type | `chain-of-thought`, `direct`, `tree-of-thought` |
| Status | `active`, `inactive`, `pending` |
| Priority | `low`, `medium`, `high`, `critical` |
| Access level | `public`, `internal`, `restricted`, `confidential` |

### Rules

- Single-word values: lowercase
- Multi-word values: kebab-case (hyphen-separated, all lowercase)
- No underscores
- Be descriptive but concise
- Use present tense for states (`active`, not `activated`)

## File Organization

### Directory Structure

```
schemas/
├── core/
│   ├── BaseEntity.schema.json
│   └── CoreMetadata.schema.json
├── entity/
│   ├── Character.schema.json
│   └── Item.schema.json
├── state/
│   ├── StateMachine.schema.json
│   └── Transition.schema.json
├── narrative/
│   ├── Beat.schema.json
│   └── Act.schema.json
├── media/
│   ├── Sprite.schema.json
│   └── Animation.schema.json
└── governance/
    └── ...
```

### One Schema Per File

- Each file contains exactly one top-level schema definition
- `$defs` may contain supporting type definitions used only within that schema
- Shared `$defs` that are used across multiple schemas should be extracted into their own schema file

## Version Metadata in Schema

Each schema file must include version metadata:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storynaram.dev/schemas/entity/Character.schema.json",
  "title": "Character",
  "description": "A narrative character entity",
  "x-storynaram": {
    "version": "1.2.3",
    "lifecycleStatus": "stable",
    "category": "entity"
  }
}
```
