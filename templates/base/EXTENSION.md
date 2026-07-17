# BaseExtension

## Purpose
Provides forward-compatible customization points. Every entity supports plugins, custom fields, custom metadata, custom components, and schema extensions without modifying the base template.

## Required Fields
None (all optional)

## Optional Fields
- `pluginRegistration` — plugin identifiers and configs
- `customFields` — typed custom field values
- `customMetadata` — arbitrary metadata (any valid JSON)
- `customComponents` — UI/processor/renderer/hook references
- `schemaExtensions` — additional JSON Schema constraints

## Inheritance Rules
- **Final**: none
- **Overrideable**: `pluginRegistration`, `customFields`, `customMetadata`, `customComponents`, `schemaExtensions`
