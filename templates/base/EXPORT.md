# BaseExport

## Purpose
Configures export capabilities per entity type. Supports multiple formats, transformer pipelines, destinations, and scheduling.

## Required Fields
None (all optional)

## Optional Fields
- `exportable` — whether entity supports export (default: true)
- `formats` — supported export formats
- `transformers` — transformer plugin pipeline
- `destinations` — export destinations
- `scheduling` — cron-based auto-export
- `scope` — full/partial/filtered export
- `includeRelations` — include related entities
- `includeHistory` — include event history

## Inheritance Rules
- **Final**: `exportable`
- **Overrideable**: `formats`, `transformers`, `destinations`, `scheduling`, `scope`
