# Indexes Directory

## Purpose
The indexing strategy repository. Every indexing approach, search optimization, and retrieval strategy for navigating the Storynaram data at scale is defined here.

## Responsibility
Defines how data is indexed, searched, and retrieved â€” primary indexes, secondary indexes, composite indexes, full-text search strategies, and performance optimization patterns for datasets of up to millions of entities.

## Files (planned)
- CHARACTER_INDEX.md â€” Character entity indexing strategy
- BOOK_INDEX.md â€” Book entity indexing strategy
- SCENE_INDEX.md â€” Scene entity indexing strategy
- TIMELINE_INDEX.md â€” Timeline entity indexing strategy
- LOCATION_INDEX.md â€” Location entity indexing strategy
- ORGANIZATION_INDEX.md â€” Organization entity indexing strategy
- ITEM_INDEX.md â€” Item entity indexing strategy
- TAG_INDEX.md â€” Tag-based search indexing strategy
- FULLTEXT_INDEX.md â€” Full-text search strategy
- COMPOSITE_INDEX.md â€” Composite and cross-domain index strategy

## Naming Convention
- UPPER_SNAKE_CASE.md â€” consistent pattern
- One file per indexed domain

## Relationships
- **standards/** ID and reference standards enable indexing
- **types/** index entries use standard types (Identifier, Reference)
- **contracts/** contract fields determine what is indexable
- **scripts/** implements indexing strategies
- **memory/** uses indexes for retrieval
