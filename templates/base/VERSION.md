# BaseVersion

## Purpose
Manages schema, template, and entity-level versioning. Ensures backward compatibility and migration tracking.

## Responsibilities
- Track schema version of the JSON structure
- Track template version used to generate the document
- Track entity content version (semantic versioning)
- Maintain changelog with per-version descriptions
- Declare compatibility ranges for dependent systems

## Required Fields
| Field | Type | Description |
|-------|------|-------------|
| `schemaVersion` | string | Version of the JSON schema |
| `templateVersion` | string | Version of the base template |
| `entityVersion` | string | Semantic version of this entity |

## Optional Fields
- `changelog` — per-version change descriptions
- `compatibility` — min/max schema and engine version ranges

## Dependencies
None (standalone)

## Examples

```json
{
  "schemaVersion": "1.0.0",
  "templateVersion": "1.0.0",
  "entityVersion": "2.3.1",
  "compatibility": {
    "minSchemaVersion": "1.0.0",
    "maxSchemaVersion": "2.0.0",
    "minEngineVersion": "1.5.0"
  }
}
```

## Inheritance Rules
- **Final**: `schemaVersion`, `templateVersion`, `entityVersion`
- **Overrideable**: `changelog`, `compatibility`

## Validation Rules
- All version fields must match semver `^\d+\.\d+\.\d+$`
- `entityVersion` must be >= previous entity version
- `schemaVersion` must be within `compatibility` range if specified

## Future Extensions
- Automatic schema migration between versions
- Version diff generation
- Snapshot and rollback support
- Multi-branch versioning (alternate timelines)
