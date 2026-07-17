# BaseStatus

## Purpose
Defines the current lifecycle status and operational state of an entity. References the canonical status enum.

## Responsibilities
- Track current lifecycle status from the canonical enum
- Record status transitions with timestamps and reasons
- Provide status flags for permission checks (isEditable, isPublishable, etc.)
- Support rollback via previousStatus

## Required Fields
| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Current lifecycle status (from core/enums/STATUS.md) |
| `state` | string | Operational state (active, draft, published, archived) |

## Optional Fields
- `previousStatus` — status before current (for rollback)
- `statusHistory` — full transition log
- `statusFlags` — boolean flag array (isEditable, isPublishable, etc.)

## Dependencies
- `core/enums/STATUS.md` — canonical status definitions

## Examples

```json
{
  "status": "published",
  "state": "active",
  "previousStatus": "draft",
  "statusFlags": ["isEditable", "isPublishable"]
}
```

## Inheritance Rules
- **Final**: `status`, `state`
- **Overrideable**: `previousStatus`, `statusHistory`, `statusFlags`

## Validation Rules
- `status` must be a valid value from `core/enums/STATUS.md`
- `state` must be one of: active, draft, published, archived, locked, pending
- Transition must be a valid move in the lifecycle state machine

## Future Extensions
- Time-based automatic status transitions
- Conditional status gates (e.g. "can only publish if all children published")
- Status-based access control integration
