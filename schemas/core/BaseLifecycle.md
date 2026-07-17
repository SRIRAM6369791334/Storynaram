# BaseLifecycle

**File:** `BaseLifecycle.schema.json`

**Purpose:** Entity lifecycle state machine — defines states, allowed transitions, guards, actions, and lifecycle event history.

**Referenced Template:** `templates/base/BaseLifecycle.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** `currentState`, `states`, `transitions`

**Key Constraints:** `states` array defines each state with optional `entryActions`/`exitActions`. `transitions` array defines allowed `from`/`to` pairs with optional `guard` and `action`. `history` logs each `event` with timestamps.

**Validation Notes:** `transitions` must reference states defined in the `states` array. Guards are string expressions evaluated at runtime.

**Backward Compatibility:** Adding new states or transitions is additive. Removing states or transitions is breaking.
