# Types Directory

## Purpose
The reusable type system. Every complex data type, structure, and shape that appears across multiple domains is defined here.

## Responsibility
Defines composable, reusable data types â€” identifiers, references, metadata blocks, coordinates, date ranges, status blocks, tag arrays, and any other recurring data structure.

## Files (planned)
- Identifier.md â€” Global unique identifier type
- Reference.md â€” Cross-entity reference type
- Metadata.md â€” Standard metadata block type
- Coordinates.md â€” Spatial coordinate type
- Date.md â€” Date and timestamp types
- Range.md â€” Numeric and date range types
- Status.md â€” Entity status block type
- Tag.md â€” Tag data type
- Relationship.md â€” Relationship link type
- Address.md â€” Location address type
- Measurement.md â€” Measurement and unit types
- Currency.md â€” Monetary value type

## Naming Convention
- PascalCase.md â€” consistent with type naming
- One type per file

## Relationships
- **contracts/** contracts compose these types into entity definitions
- **standards/** metadata standard references Metadata type
- **schemas/** implements types as reusable JSON Schema definitions
- **validators/** validates type conformance
