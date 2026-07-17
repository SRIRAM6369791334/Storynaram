# Indexes Directory

## Purpose
Defines the Entity Indexing Strategy for the Storynaram domain model.

## Responsibility
Documents how entities are indexed for fast retrieval â€” primary indexes, reference indexes, relationship indexes, tag indexes, and specialized indexes for each domain.

## Index Strategy
| Index | Key | Entity Types |
|-------|-----|--------------|
| Primary Index | entity ID | All entities |
| Type Index | entity type prefix | All entities |
| Name Index | entity name (normalized) | Named entities |
| Relationship Index | referenced entity ID | All with relationships |
| Tag Index | tag value | Tagged entities |
| Timeline Index | date/time | Timeline entities |
| Location Index | location ID | Entities with location |
| Book Index | book ID | Narrative entities |
| Status Index | status value | All entities |
| Owner Index | owner ID | Owned entities |

## Dependencies
- entities/ â€” entity types to index
- repositories/ â€” indexes used by repositories
- queries/ â€” queries leverage indexes
