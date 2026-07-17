# BaseOwnership

## Purpose
Tracks entity ownership and container relationships. Determines who can modify, delete, or transfer the entity.

## Responsibilities
- Record the direct owner of the entity
- Record the container (parent context) if different from owner
- Define the nature of ownership (exclusive, shared, temporary, inherited)
- Maintain ownership transfer history
- Enforce permission defaults based on ownership

## Required Fields
| Field | Type | Description |
|-------|------|-------------|
| `ownerType` | string | Type of the owning entity |
| `ownerId` | string | ID of the owning entity |

## Optional Fields
- `containerType`, `containerId` — container entity (if different from owner)
- `ownershipType` — exclusive|shared|temporary|inherited|referential
- `ownerHistory` — historical transfer records
- `permissions` — permission overrides by owner/container

## Dependencies
- BaseIdentifier (for ownerId/containerId format)

## Examples

```json
{
  "ownerType": "user",
  "ownerId": "user_auth0|abc123",
  "containerType": "world",
  "containerId": "world_000042",
  "ownershipType": "exclusive"
}
```

## Inheritance Rules
- **Final**: `ownerType`, `ownerId`
- **Overrideable**: `containerType`, `containerId`, `ownerHistory`, `permissions`, `ownershipType`

## Validation Rules
- `ownerId` must match entity ID format
- `containerId` must match entity ID format if provided
- Ownership transfer must record previous owner in history

## Future Extensions
- Ownership delegation (temporary transfer)
- Co-ownership with weighted permissions
- Organizational ownership (team/department)
- Ownership-based billing/quotas
