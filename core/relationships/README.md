# Relationships Directory

## Purpose
The entity relationship model repository. Every cross-domain relationship, link type, cardinality rule, and relationship constraint in Storynaram is defined here.

## Responsibility
Documents the complete relationship graph â€” what entities connect to what other entities, how they connect, cardinality constraints, bidirectional consistency rules, and relationship lifecycle management.

## Files (planned)
- CHARACTER_RELATIONSHIPS.md â€” Character-to-entity relationship map
- WORLD_RELATIONSHIPS.md â€” World-to-entity relationship map
- BOOK_RELATIONSHIPS.md â€” Book-to-entity relationship map
- TIMELINE_RELATIONSHIPS.md â€” Timeline-to-entity relationship map
- LOCATION_RELATIONSHIPS.md â€” Location-to-entity relationship map
- ORGANIZATION_RELATIONSHIPS.md â€” Organization-to-entity relationship map
- MAGIC_RELATIONSHIPS.md â€” Magic-to-entity relationship map
- ITEM_RELATIONSHIPS.md â€” Item-to-entity relationship map
- CROSS_DOMAIN.md â€” Cross-domain relationship patterns
- CARDINALITY.md â€” Cardinality and multiplicity rules
- CASCADE.md â€” Cascade behavior for relationship operations

## Naming Convention
- UPPER_SNAKE_CASE.md â€” consistent pattern
- One file per domain or concern

## Relationships
- **contracts/** contracts define relationship fields
- **standards/** reference standard enables relationship modeling
- **types/** Relationship type is defined in types/
- **indexes/** relationships enable cross-domain indexing
- **memory/** uses relationship models for knowledge graph
- **validators/** validates relationship integrity
