# Relationships Directory

## Purpose
Defines the complete Relationship Matrix for the Storynaram domain model.

## Responsibility
Documents every relationship between entities â€” cardinality, ownership, direction, and semantics. The relationship matrix is the authoritative source for how entities connect.

## Relationship Types
| Type | Symbol | Description |
|------|--------|-------------|
| Composition | â—†â€” | Child cannot exist without parent |
| Aggregation | â—‡â€” | Child can exist independently |
| Association | â€” | Entities know about each other |
| Dependency | - - > | Entity depends on another |
| Inheritance | â€”â–· | Type specialization |

## See detailed relationship documents:
- relationship/matrix.md â€” Full relationship matrix
- relationship/cardinality.md â€” Cardinality rules
- relationship/patterns.md â€” Relationship patterns
