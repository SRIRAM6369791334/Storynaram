# Cross-Domain Relationships

## Purpose
Defines cross-domain relationship patterns and best practices.

## Cross-Domain Links
Characters, locations, events, items, organizations, and magic systems form a dense cross-domain graph:

`
Character â—„â”€â”€â”€â”€â”€â”€â–º Organization
Character â—„â”€â”€â”€â”€â”€â”€â–º Location
Character â—„â”€â”€â”€â”€â”€â”€â–º Event
Character â—„â”€â”€â”€â”€â”€â”€â–º Item
Event     â—„â”€â”€â”€â”€â”€â”€â–º Location
Event     â—„â”€â”€â”€â”€â”€â”€â–º Book
Item      â—„â”€â”€â”€â”€â”€â”€â–º Magic
Location  â—„â”€â”€â”€â”€â”€â”€â–º World
Book      â—„â”€â”€â”€â”€â”€â”€â–º Plot
`

## Relationship Patterns

### Pattern 1: Direct Reference
Simple ID reference from one entity to another.
`json
{
  "currentLocation": "city_000001"
}
`

### Pattern 2: Array Reference
Multiple IDs in an array field.
`json
{
  "characters": ["hero_000001", "heroine_000002"]
}
`

### Pattern 3: Typed Reference
Reference with type and role metadata.
`json
{
  "participants": [
    { "id": "hero_000001", "role": "protagonist" },
    { "id": "villain_000001", "role": "antagonist" }
  ]
}
`

### Pattern 4: Relationship Entity
For complex relationships (especially character-to-character), a dedicated relationship entity is used:
`json
{
  "id": "relation_000001",
  "type": "relationship",
  "data": {
    "entityA": "hero_000001",
    "entityB": "heroine_000002",
    "type": "romantic",
    "status": "active",
    "startDate": "1247-06-21",
    "notes": "Met during the coronation"
  }
}
`

## Cardinality Rules
| Symbol | Meaning |
|--------|---------|
| 1:1 | One-to-one |
| 1:N | One-to-many (parent-child) |
| N:1 | Many-to-one (child-parent) |
| M:N | Many-to-many |

## Bidirectional Consistency
When entity A references entity B, entity B should maintain an inverse reference to A. This ensures the graph can be traversed in either direction without full scans.
