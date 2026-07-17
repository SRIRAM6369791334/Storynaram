# BaseHistory

## Purpose
Records every mutation to an entity as a time-ordered event stream. Foundation for audit, undo, and replication.

## Required Fields
None (all optional)

## Optional Fields
- `events` — time-ordered event array (newest first)
- `eventCount` — denormalized total count
- `lastEvent` — denormalized most recent event summary

## Inheritance Rules
- **Final**: none
- **Overrideable**: `events`, `eventCount`, `lastEvent`
