# Metadata Type

## Purpose
Defines the standard metadata block type used in every Storynaram entity.

## Definition
Required fields: `version`, `status`, `createdAt`, `updatedAt`

Optional fields: `createdBy`, `updatedBy`, `description`, `tags`, `versionHistory`

## Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | integer | Yes | Starts at 1, incremented on modification |
| `status` | string | Yes | One of the Status enum values |
| `createdAt` | string | Yes | ISO 8601 UTC timestamp |
| `updatedAt` | string | Yes | ISO 8601 UTC timestamp |
| `createdBy` | string | No | Creator identifier |
| `updatedBy` | string | No | Last modifier identifier |
| `description` | string | No | Entity description (max 2000 chars) |
| `tags` | array | No | Tag array |
| `versionHistory` | array | No | Array of version records |

## Example
```json
{
  "metadata": {
    "version": 1,
    "status": "draft",
    "createdAt": "2026-07-17T12:00:00Z",
    "updatedAt": "2026-07-17T12:00:00Z",
    "createdBy": "author",
    "tags": ["fantasy"]
  }
}
```

## Version History Entry
```json
{
  "version": 1,
  "date": "2026-07-17T12:00:00Z",
  "change": "Initial creation"
}
```

## Usage
Present in every entity JSON as the `metadata` field. This is the single metadata standard — no entity should deviate from it.
