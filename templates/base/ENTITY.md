# BaseEntity

## Purpose
Universal entity root that composes all base templates. Every entity in Storynaram is an extension of BaseEntity.

## Required Fields
| Field | Type | Description |
|-------|------|-------------|
| `$schema` | string | JSON schema reference URL |
| `identifier` | object | BaseIdentifier block |
| `metadata` | object | BaseMetadata block |
| `audit` | object | BaseAudit block |

## Optional Fields
All other base blocks are optional and included as needed per entity type:
- `version`, `status`, `lifecycle`, `ownership`
- `references`, `relationships`, `tags`
- `visibility`, `permissions`, `localization`
- `attachments`, `comments`, `history`
- `validation`, `ai`, `search`, `index`
- `security`, `export`, `import`, `workflow`
- `extension`, `customProperties`

## Dependencies
Composes all 25 base templates

## Examples

```json
{
  "$schema": "https://storynaram.dev/schemas/character.v1.json",
  "identifier": { "prefix": "char", "sequence": "000001", "type": "character" },
  "metadata": { "title": "Aragorn", "language": "en" },
  "audit": { "createdBy": "system", "createdAt": "2026-07-17T00:00:00Z", "updatedBy": "system", "updatedAt": "2026-07-17T00:00:00Z" },
  "status": { "status": "published", "state": "active" },
  "version": { "schemaVersion": "1.0.0", "templateVersion": "1.0.0", "entityVersion": "1.0.0" },
  "ai": { "visibility": "visible", "canon": { "importance": 90, "locked": true } }
}
```

## Inheritance Rules
- **Final**: `$schema`, `identifier.id`, `identifier.prefix`, `identifier.sequence`, `metadata.title`
- **Overrideable**: `customProperties`
- Entity type templates may add new blocks but may not remove required blocks
- Entity type templates may narrow value ranges but may not widen them
