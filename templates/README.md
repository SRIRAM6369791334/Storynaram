# Templates Directory

## Purpose
The template registry. Reusable templates for characters, locations, items, organizations, and every other entity type in the Story Operating System.

## Responsibility
Provides base templates that enforce structure and completeness for every entity type. Templates ensure consistency, reduce repetitive work, and guide AI generation.

## Naming Convention
- **Files**: {entity_type}_template.json (e.g., character_template.json, location_template.json)
- **IDs** follow config/id_rules.json
- **Structure**: Flat directory for universal access

## Contents
- Entity templates for every domain type
- Default field definitions
- Required and optional field specifications
- Validation rule templates
- Example templates with documentation
- Relationship field templates
- Metadata field templates
- AI prompt templates for entity generation

## Future Expansion
- Template versioning
- Template inheritance system
- Dynamic template generation
- Template-based entity validation
- Template editor UI
- Import/export template formats

## Relationships
- **Schemas/** templates are based on schema definitions
- **Config/** template configuration and defaults
- **Scripts/generators** templates used by generators
- **All directories** templates shape entity creation
