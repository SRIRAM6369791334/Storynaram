# Constants Directory

## Purpose
The system-wide constants registry. Every constant value, default setting, format specification, and fixed parameter used across Storynaram is defined here.

## Responsibility
Provides a single source of truth for all constant values â€” date formats, time zones, character encodings, file extensions, default values, size limits, and other fixed parameters.

## Files (planned)
- FORMATS.md â€” Date, time, number, and encoding formats
- DEFAULTS.md â€” Default values for all entity types
- LIMITS.md â€” Size limits, count limits, and thresholds
- EXTENSIONS.md â€” File extension catalog
- COLORS.md â€” Standard color palette definitions
- PATHS.md â€” Standard path conventions and reserved names

## Naming Convention
- UPPER_SNAKE_CASE.md â€” consistent pattern
- One file per constant category

## Relationships
- **standards/** constants are referenced by all standards
- **contracts/** contracts use constants for defaults and limits
- **enums/** enum values are constants
- **config/** may override or reference constants
- **scripts/** reads constants for consistent behavior
