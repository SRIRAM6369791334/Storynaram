# Character Relationships

## Purpose
Defines all entity relationships involving characters.

## Relationship Map
`
Character â”€â”€â–º Scene        (appears in)
Character â”€â”€â–º Chapter      (appears in)
Character â”€â”€â–º Book         (appears in)
Character â”€â”€â–º Timeline     (participates in event)
Character â”€â”€â–º Location     (located at / originates from)
Character â”€â”€â–º Organization (member of)
Character â”€â”€â–º Family       (belongs to)
Character â”€â”€â–º Item         (owns / carries)
Character â”€â”€â–º Character    (related to: friend, enemy, family)
`

## Relationship Table
| Source | Target | Type | Cardinality | Bidirectional |
|--------|--------|------|-------------|---------------|
| Character | Scene | appears-in | M:N | Yes |
| Character | Chapter | appears-in | M:N | Yes |
| Character | Book | appears-in | M:N | Yes |
| Character | Event | participates-in | M:N | Yes |
| Character | Location | located-at | M:1 | Yes |
| Character | Location | originates-from | M:1 | No |
| Character | Organization | member-of | M:N | Yes |
| Character | Family | belongs-to | M:1 | Yes |
| Character | Item | owns | M:N | Yes |
| Character | Character | related-to | M:N | Yes |

## Storage
Character-to-entity relationships are stored in the character's elationships.related array.
Character-to-character relationships are stored in characters/relationships/.
