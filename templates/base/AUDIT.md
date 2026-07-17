# BaseAudit

## Purpose
Tracks provenance and accountability for every entity modification. Required on all entities.

## Responsibilities
- Record creation and last-update timestamps and actors
- Track approval and review workflows
- Manage entity locks (prevent concurrent edits)
- Maintain revision chain with annotated history

## Required Fields
| Field | Type | Description |
|-------|------|-------------|
| `createdBy` | string | User/system that created the entity |
| `createdAt` | date-time | ISO 8601 creation timestamp |
| `updatedBy` | string | Last user/system to modify |
| `updatedAt` | date-time | ISO 8601 last-modification timestamp |

## Optional Fields
- `approvedBy`, `approvedAt` — approval tracking
- `reviewedBy`, `reviewedAt` — review tracking
- `lockedBy`, `lockedAt` — edit lock tracking
- `revision` — current revision identifier
- `revisionNotes` — annotated revision history

## Dependencies
None (standalone)

## Examples

```json
{
  "createdBy": "user_auth0|abc123",
  "createdAt": "2026-07-17T10:00:00Z",
  "updatedBy": "user_auth0|abc123",
  "updatedAt": "2026-07-17T14:30:00Z"
}
```

## Inheritance Rules
- **Final**: `createdBy`, `createdAt`, `updatedBy`, `updatedAt`, `revision`
- **Overrideable**: `approvedBy`, `approvedAt`, `reviewedBy`, `reviewedAt`, `lockedBy`, `lockedAt`, `revisionNotes`

## Validation Rules
- `createdAt` must be a valid ISO 8601 date-time
- `updatedAt` must be >= `createdAt`
- `revision` should be globally unique (UUID or content hash)

## Future Extensions
- Distributed tracing correlation IDs
- Multi-signature approval workflows
- Immutable audit log append-only store
- Audit event streaming to external SIEM
