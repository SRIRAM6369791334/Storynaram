# Schema Standard

## Purpose
Defines the standards for JSON Schema definition files used to validate Storynaram entity data.

## Schema File Naming
- Format: {EntityType}.schema.json â€” Character.schema.json
- One schema file per entity type
- Schema files live in schemas/ at project root

## Schema Versioning
- Schema versions tracked in filename: Character.schema.v1.json
- When schema evolves, create new version file
- Old schema versions are retained for backward compatibility
- See VERSION_STANDARD for schema version rules

## Schema Structure
Every schema follows this structure:

`json
{
  "": "http://json-schema.org/draft-07/schema#",
  "": "https://storynaram.dev/schemas/character.v1.json",
  "title": "Character",
  "description": "Schema for Storynaram character entities",
  "type": "object",
  "required": ["id", "type", "metadata"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z]+_[0-9]{6,}$",
      "description": "Globally unique character identifier"
    },
    "type": {
      "type": "string",
      "const": "character",
      "description": "Entity type identifier"
    },
    "metadata": {
      "": "#/definitions/Metadata"
    },
    "data": {
      "type": "object"
    },
    "relationships": {
      "type": "object"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "definitions": {
    "Metadata": {
      "type": "object",
      "required": ["version", "status", "createdAt", "updatedAt"],
      "properties": {
        "version": { "type": "integer", "minimum": 1 },
        "status": { "": "../enums/status.json" },
        "createdAt": { "type": "string", "format": "date-time" }
      }
    }
  }
}
`

## Schema Design Rules
1. **Use JSON Schema draft-07** â€” currently the most widely supported version
2. **One schema per entity type** â€” single responsibility
3. **Required fields** are explicitly listed in equired array
4. **Optional fields** are omitted from equired but defined in properties
5. **Use $ref** for reusable type definitions
6. **Use definitions** for shared sub-schemas within a file
7. **External references** use $ref with relative paths for cross-file schemas
8. **Every schema must include** $schema, $id, 	itle, description
9. **Pattern properties** enforce ID_STANDARD format
10. **Enum values** from enums/ are used where applicable

## Schema Validation Levels

### Level 1: Structural
- Valid JSON format
- Required fields present
- Correct types

### Level 2: Format
- ID format validation
- Date format validation
- Email/URL format validation

### Level 3: Semantic
- Reference integrity (referenced IDs exist)
- Enum value validation
- Field constraint validation (min, max, pattern)

### Level 4: Business Rule
- Cross-field validation (field A and field B must be consistent)
- Business logic rules
- Custom validators

## Schema Composition
Schemas should compose reusable types from core/types/:
`json
{
  "identifier": { "": "../core/types/Identifier.json" },
  "metadata": { "": "../core/types/Metadata.json" }
}
`
"@ | Set-Content -Path (Join-Path E:\Storynaram\core\standards "SCHEMA_STANDARD.md") -Encoding UTF8

# ============================================================
# TEMPLATE_STANDARD.md
# ============================================================
@"
# Template Standard

## Purpose
Defines the standards for reusable entity templates in Storynaram. Templates provide pre-structured entity skeletons that enforce consistency and speed up creation.

## Template File Naming
- Format: {entity_type}_template.json â€” character_template.json
- One template file per entity type
- Template files live in 	emplates/ at project root

## Template Structure
Every template follows this structure:

`json
{
  "templateVersion": "1.0.0",
  "entityType": "character",
  "description": "Template for creating new character entities",
  "schema": "Character.schema.v1.json",
  "defaults": {
    "id": null,
    "type": "character",
    "name": "",
    "description": "",
    "metadata": {
      "version": 1,
      "status": "draft",
      "createdAt": null,
      "updatedAt": null,
      "createdBy": null,
      "updatedBy": null
    },
    "data": {},
    "relationships": {
      "parent": null,
      "children": [],
      "related": []
    },
    "tags": []
  },
  "requiredFields": ["id", "type", "name", "metadata.version", "metadata.status"],
  "recommendedFields": ["description", "metadata.createdBy", "tags"],
  "examples": [
    {
      "name": "Minimal character",
      "description": "The minimum required fields to create a character"
    }
  ],
  "validationRules": [
    "id must match format: {prefix}_000000",
    "type must be 'character'",
    "version must start at 1"
  ]
}
`

## Template Design Rules
1. **Every entity type** should have a corresponding template
2. **Defaults** provide sensible starting values
3. **Required fields** are listed â€” templates enforce but don't fill them
4. **Recommended fields** are suggested but not enforced
5. **Schema reference** links to the corresponding schema
6. **Examples** demonstrate common usage patterns
7. **Validation rules** document what validators will check

## Template Versioning
- Templates carry their own version: "templateVersion": "1.0.0"
- Template versions are independent of entity versions
- Template MAJOR bump: incompatible structural change
- Template MINOR bump: new optional fields added
- Template PATCH bump: documentation or example updates

## Template Usage
1. Copy the template from 	emplates/
2. Fill in default values with actual content
3. Add entity-specific fields to the data object
4. Establish relationships in the elationships block
5. Save as a new entity file in the appropriate domain directory
6. Validate against the schema

## Template Categories

### Entity Templates
| Template | For |
|----------|-----|
| character_template.json | All character types |
| world_template.json | World geography entities |
| location_template.json | Specific locations |
| item_template.json | All item types |
| organization_template.json | Organizations |
| event_template.json | Timeline events |
| magic_template.json | Magic entities |
| 	echnology_template.json | Technology entities |
| scene_template.json | Scene entities |
| chapter_template.json | Chapter entities |
| ook_template.json | Book entities |

### Document Templates
| Template | For |
|----------|-----|
| contract_template.json | Core contracts |
| interface_template.json | Interface definitions |
| schema_template.json | JSON Schema files |
| prompt_template.md | AI prompt documents |
