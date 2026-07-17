# Extension Guide

## How to Extend the Base Template Framework

### 1. Creating a New Base Template

If a capability is missing from the framework:

1. Create `BaseNewFeature.template.json` following the pattern:
   - `template` field with name
   - `version` field
   - `description` field
   - `type`: "object"
   - `required` / `properties`
   - `inheritanceRules` block with `final`, `overrideable`, `extensible`
2. Create `NEWFEATURE.md` with Purpose, Responsibilities, Required/Optional Fields, Dependencies, Examples, Inheritance Rules, Validation Rules, Future Extensions
3. Add the `$ref` to `BaseEntity.template.json` properties
4. Add to the `composes` array in `BaseEntity.template.json`
5. Update `README.md` table

### 2. Creating an Entity-Specific Template

Every entity type extends `BaseEntity`:

```json
{
  "template": "CharacterEntity",
  "extends": "BaseEntity",
  "version": "1.0.0",
  "properties": {
    "identifier": { "$ref": "BaseIdentifier.template.json" },
    "metadata": { "$ref": "BaseMetadata.template.json" },
    "audit": { "$ref": "BaseAudit.template.json" },
    "entitySpecific": {
      "type": "object",
      "properties": { ... }
    }
  }
}
```

### 3. Adding Custom Fields (No Template Change)

Use `BaseExtension.customFields` for entity-specific fields without modifying base templates:

```json
{
  "extension": {
    "customFields": {
      "myCustomField": {
        "value": "some-value",
        "type": "string",
        "schema": "my-plugin/schemas/custom-field.json",
        "validated": true
      }
    }
  }
}
```

### 4. Plugin System Integration

Register a plugin via `BaseExtension.pluginRegistration`:

```json
{
  "extension": {
    "pluginRegistration": [
      {
        "pluginId": "my-plugin",
        "version": "1.0.0",
        "enabled": true,
        "config": { "apiKey": "...", "endpoint": "..." }
      }
    ]
  }
}
```

### 5. Adding Custom UI Components

```json
{
  "extension": {
    "customComponents": [
      {
        "componentId": "my-character-card",
        "type": "ui",
        "config": { "view": "detailed", "fields": ["name", "title"] }
      }
    ]
  }
}
```

### 6. Schema Extensions

Add additional JSON Schema constraints without changing base:

```json
{
  "extension": {
    "schemaExtensions": [
      {
        "scope": "/properties/metadata/properties/title",
        "definition": { "maxLength": 100 }
      }
    ]
  }
}
```

## Rules of Extension

1. **Never modify BaseEntity.template.json directly** for entity-specific needs
2. **Never remove required blocks** from subtypes
3. **Never widen constraints** on final fields (you can narrow them)
4. **Always use BaseExtension** for experimental or plugin-owned fields
5. **Always document** custom extensions in the entity's own documentation
6. **Version all extensions** — custom fields and plugins must declare version compatibility
