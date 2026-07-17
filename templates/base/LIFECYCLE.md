# BaseLifecycle

## Purpose
Defines a full state machine for entity lifecycle. Supports states, transitions, guards, and event hooks.

## Responsibilities
- Define all possible states for an entity type
- Define allowed transitions with guard conditions
- Execute entry/exit actions per state
- Record full lifecycle event history

## Required Fields
| Field | Type | Description |
|-------|------|-------------|
| `currentState` | string | Currently active lifecycle state |
| `states` | array | All possible states with entry/exit actions |
| `transitions` | array | Allowed transitions with guards |

## Optional Fields
- `history` — full lifecycle event history

## Dependencies
- BaseStatus (state values should align with status enum)

## Examples

```json
{
  "currentState": "draft",
  "states": [
    { "name": "draft", "label": "Draft", "entryActions": ["initialize"], "exitActions": ["validate"] }
  ],
  "transitions": [
    { "from": "draft", "to": "published", "guard": "isComplete", "action": "publish" }
  ]
}
```

## Inheritance Rules
- **Final**: `currentState`, `states`, `transitions`
- **Overrideable**: `history`

## Validation Rules
- `currentState` must exist in `states`
- All transitions must reference valid from/to state names
- Guard conditions must be evaluatable expressions
- No duplicate state names allowed

## Future Extensions
- Visual state machine editor integration
- Automated state transition via AI triggers
- Parallel states (region-based state machines)
- State machine persistence and recovery
