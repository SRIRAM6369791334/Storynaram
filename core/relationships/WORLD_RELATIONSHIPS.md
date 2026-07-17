# World Relationships

## Purpose
Defines all entity relationships involving world geography entities.

## Relationship Map
`
Continent â”€â”€â–º Country       (contains)
Country   â”€â”€â–º Kingdom       (may contain)
Kingdom   â”€â”€â–º Empire        (may belong to)
Country   â”€â”€â–º Province      (contains)
Province  â”€â”€â–º District      (contains)
District  â”€â”€â–º City          (contains)
District  â”€â”€â–º Village       (contains)
City      â”€â”€â–º Landmark      (contains)
`

## Hierarchy
`
Empire
  â””â”€â”€ Kingdom
       â””â”€â”€ Country
            â”œâ”€â”€ Province
            â”‚    â””â”€â”€ District
            â”‚         â”œâ”€â”€ City
            â”‚         â””â”€â”€ Village
            â”œâ”€â”€ Forest
            â”œâ”€â”€ Mountain
            â””â”€â”€ River
`

## Relationship Table
| Source | Target | Type | Cardinality | Bidirectional |
|--------|--------|------|-------------|---------------|
| Continent | Country | contains | 1:N | Yes |
| Country | Kingdom | belongs-to | N:1 | Yes |
| Kingdom | Empire | belongs-to | N:1 | Yes |
| Country | Province | contains | 1:N | Yes |
| Province | District | contains | 1:N | Yes |
| District | City | contains | 1:N | Yes |
| District | Village | contains | 1:N | Yes |
| City | Landmark | contains | 1:N | Yes |

## Storage
World hierarchical relationships are stored in each entity's elationships.parent and elationships.children fields.
