# BaseImport

## Purpose
Configures import capabilities per entity type. Supports multiple source formats, parser pipelines, validation, conflict resolution, and field mapping.

## Required Fields
None (all optional)

## Optional Fields
- `importable` — whether entity supports import (default: true)
- `sources` — supported import source types
- `parsers` — parser plugin pipeline
- `validation` — import-time validation strictness
- `conflictResolution` — ID conflict strategy
- `mapping` — field mapping from source to target schema
- `defaults` — default values for missing fields
- `postProcess` — post-import processing hooks

## Inheritance Rules
- **Final**: `importable`, `conflictResolution`
- **Overrideable**: `sources`, `parsers`, `validation`, `mapping`, `defaults`, `postProcess`
