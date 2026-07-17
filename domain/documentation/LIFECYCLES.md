# Entity Lifecycles

## State Machines and Transitions

---

## 1. Common Base Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft : Create
    Draft --> Review : Submit
    Review --> Approved : Approve
    Review --> Rejected : Reject
    Review --> Draft : Revise
    Approved --> Locked : Freeze
    Approved --> Archived : Archive
    Locked --> Archived : Archive
    Locked --> Draft : Unlock
    Rejected --> Draft : Resubmit
    Archived --> Draft : Restore
    Archived --> [*] : Delete
```

| Transition | Trigger | Description |
|-----------|---------|-------------|
| Create | Entity creation | Initial draft state |
| Submit | User action | Send for review |
| Approve | Review action | Accept as final |
| Reject | Review action | Return for revision |
| Revise | User action | Modify after rejection |
| Freeze | Lock action | Prevent further edits |
| Archive | Archive action | Mark as historical |
| Unlock | Unlock action | Allow edits again |
| Restore | Restore action | Bring back from archive |
| Delete | Delete action | Permanently remove |

---

## 2. Book Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Outline
    Outline --> Draft : Begin writing
    Draft --> Revision : Complete draft
    Revision --> Beta : Internal review
    Revision --> Draft : Major changes needed
    Beta --> Editing : Beta feedback received
    Beta --> Revision : Significant revisions
    Editing --> Ready : Final polish
    Ready --> Published : Release
    Published --> Archived : Deprecated
    Published --> Editing : New edition
    Draft --> Archived : Abandoned
    Archived --> Published : Revive
```

| State | Description | Allowed Actions |
|-------|-------------|-----------------|
| Outline | Chapter-by-chapter plan | Add/edit chapters, scenes |
| Draft | First draft writing | Write/edit content |
| Revision | Self-revision | Edit, restructure |
| Beta | External feedback | Read-only + annotations |
| Editing | Line/copy editing | Edit formatting, grammar |
| Ready | Finalized | Read-only |
| Published | Released | Distribution |
| Archived | Historical record | Read-only |

---

## 3. Character Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Concept
    Concept --> Draft : Develop traits
    Draft --> Developed : Add backstory
    Developed --> Final : Complete profile
    Final --> Locked : Deprecate
    Developed --> Archived : Abandon
    Final --> Archived : Archived
    Locked --> Archived : Archived
    Archived --> Developed : Revise
    Archived --> Final : Restore
```

| State | Description | Allowed Actions |
|-------|-------------|-----------------|
| Concept | Basic idea, name, archetype | Edit basic info |
| Draft | Core traits, description | Edit traits, appearance |
| Developed | Full backstory, relationships | Edit all fields |
| Final | Complete, canon | Read-only |
| Locked | Frozen, no changes | Read-only (special override) |
| Archived | Historical | Read-only |

---

## 4. World Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Development : Geography defined
    Development --> Final : Complete
    Final --> Frozen : No changes expected
    Development --> Archived : Abandoned
    Final --> Archived : Deprecated
    Frozen --> Archived : Archived
    Archived --> Development : Expand
```

| State | Description | Allowed Actions |
|-------|-------------|-----------------|
| Draft | Initial concepts | Add continents, basic geography |
| Development | Building locations, cultures | Add all geography entities |
| Final | World complete | Read-only |
| Frozen | Locked for series canon | Read-only |
| Archived | Historical record | Read-only |

---

## 5. Scene Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Planned
    Planned --> Written : Write content
    Written --> Revised : Edit
    Revised --> Polished : Finalize
    Polished --> Final : Approved
    Planned --> Removed : Cancel
    Written --> Removed : Delete
    Revised --> Removed : Delete
    Removed --> Planned : Restore
```

| State | Description | Allowed Actions |
|-------|-------------|-----------------|
| Planned | Outline only | Edit outline, assign characters |
| Written | First draft | Edit dialogue, narration |
| Revised | Edit pass | Edit prose, structure |
| Polished | Ready for review | Minor edits only |
| Final | Approved | Read-only |
| Removed | Soft-deleted | Restore or permanent delete |

---

## 6. Event Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Proposed
    Proposed --> Planned : Scheduled
    Planned --> Occurring : Started
    Occurring --> Resolved : Completed
    Resolved --> Canon : Confirmed
    Proposed --> Discarded : Rejected
    Planned --> Discarded : Canceled
    Resolved --> Revised : Retconned
```

| State | Description |
|-------|-------------|
| Proposed | Suggested event |
| Planned | Added to timeline |
| Occurring | Active event in progress |
| Resolved | Event completed |
| Canon | Confirmed part of history |
| Discarded | Rejected or canceled |
| Revised | Modified after resolution |

---

## 7. Item / Magic / Organization Lifecycle

| State | Item | Magic | Organization |
|-------|------|-------|-------------|
| Draft | Conceptual | Conceptual | Conceptual |
| Available | Passive | Active | Active |
| Owned | Owned | — | — |
| Consumed | Used up | — | — |
| Restricted | — | Restricted | Inactive |
| Lost | — | Lost | Defunct |
| Destroyed | Destroyed | — | — |
| Archived | Archived | Archived | Archived |

---

## 8. State Transition Rules

| Transition Rule | Description |
|----------------|-------------|
| Sequential transitions | States normally progress forward; regression requires explicit override |
| Review gate | Draft → Approved requires review approval |
| Archive from any | Most states allow direct transition to Archived |
| Locked immutability | Locked/Frozen states require special override for any change |
| Soft deletion | Archived/Removed acts as soft delete; data is preserved |
| Immutable audit | All state transitions are logged with timestamp and actor |
