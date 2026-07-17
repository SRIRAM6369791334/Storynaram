# Schema Standard

## Purpose
Defines the standards for JSON Schema definition files used to validate Storynaram entity data.

## Schema File Naming
- Format: `{EntityType}.schema.json` — `Character.schema.json`
- One schema file per entity type
- Schema files live in `schemas/` at project root
- Versioned: `Character.schema.v1.json`

## Schema Structure
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://storynaram.dev/schemas/character.v1.json",
  "title": "Character",
  "description": "Schema for Storynaram character entities",
  "type": "object",
  "required": ["id", "type", "metadata"],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z]+_[0-9]{6,}$" },
    "type": { "type": "string", "const": "character" },
    "metadata": { "$ref": "#/definitions/Metadata" },
    "data": { "type": "object" },
    "relationships": { "type": "object" },
    "tags": { "type": "array", "items": { "type": "string" } }
  },
  "definitions": {
    "Metadata": {
      "type": "object",
      "required": ["version", "status", "createdAt", "updatedAt"],
      "properties": {
        "version": { "type": "integer", "minimum": 1 },
        "status": { "type": "string" },
        "createdAt": { "type": "string", "format": "date-time" },
        "updatedAt": { "type": "string", "format": "date-time" }
      }
    }
  }
}
```

## Schema Design Rules
1. **Use JSON Schema draft-07**
2. **One schema per entity type**
3. **Required fields** explicitly listed in `required` array
4. **Optional fields** defined in `properties` but not in `required`
5. **Use `$ref`** for reusable type definitions
6. **Use `definitions`** for shared sub-schemas
7. **Every schema must include** `$schema`, `$id`, `title`, `description`
8. **Pattern properties** enforce ID_STANDARD format

## Validation Levels
| Level | Checks |
|-------|--------|
| 1: Structural | Valid JSON, required fields, correct types |
| 2: Format | ID format, date format, pattern matching |
| 3: Semantic | Reference integrity, enum values, constraints |
| 4: Business Rule | Cross-field validation, business logic |

## Schema Composition
Schemas should compose reusable types from `core/types/`:
```json
{
  "identifier": { "$ref": "../core/types/Identifier.json" },
  "metadata": { "$ref": "../core/types/Metadata.json" }
}
```
