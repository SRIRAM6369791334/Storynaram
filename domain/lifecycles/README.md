# Lifecycles Directory

## Purpose
Defines the Lifecycle State Machines for every entity in the Storynaram domain model.

## Responsibility
Documents the allowed states, transitions, and transition rules for every entity type.

## Standard Lifecycle
`mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Review: Submit
    Review --> Approved: Validate
    Review --> Rejected: Issues Found
    Approved --> Locked: Finalize
    Locked --> Archived: Deprecate
    Rejected --> Draft: Revise
    Draft --> Archived: Abandon
    Approved --> Archived: Supersede
    Archived --> [*]
`

## Entity-Specific Lifecycles
See detailed lifecycle documents in this directory.

## Dependencies
- entities/ â€” lifecycle applies to entities
- events/ â€” lifecycle transitions raise events
- commands/ â€” lifecycle transitions triggered by commands
