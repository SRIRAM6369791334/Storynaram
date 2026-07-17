# Enums Directory

## Purpose
The standard enumerations registry. Every enumerated type, status value, category, classification, and fixed set of allowed values used across Storynaram is defined here.

## Responsibility
Defines all closed sets of values â€” statuses (draft, published, archived), types (protagonist, antagonist), categories (weapon, armor, potion), and any other value that must be selected from a predefined list.

## Files (planned)
- STATUS.md â€” Status enumerations for all entity lifecycles
- CHARACTER_TYPE.md â€” Character role and type enumerations
- WORLD_TYPE.md â€” World geography and feature types
- BOOK_TYPE.md â€” Book classification enumerations
- TIMELINE_TYPE.md â€” Timeline event type enumerations
- MAGIC_TYPE.md â€” Magic system and spell type enumerations
- ITEM_TYPE.md â€” Item category enumerations
- ORGANIZATION_TYPE.md â€” Organization type enumerations
- TAG_CATEGORY.md â€” Tag category enumerations
- PRIORITY.md â€” Priority level definitions
- SEVERITY.md â€” Severity level definitions

## Naming Convention
- UPPER_SNAKE_CASE.md â€” consistent pattern
- One file per enum category

## Relationships
- **standards/** tag standard references enum categories
- **contracts/** contract fields reference enum values
- **validators/** validates field values against enums
- **constants/** enum values are a subset of constants
