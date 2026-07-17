# Value Objects Directory

## Purpose
Defines immutable Value Objects used across the Storynaram domain model.

## Responsibility
Value objects are immutable, self-contained types that represent descriptive aspects of entities. They have no identity of their own and are compared by their structure.

## Value Objects
| Value Object | Attributes | Used By |
|--------------|------------|---------|
| **Address** | street, city, country, coordinates | Location, Character |
| **Coordinates** | latitude, longitude, elevation | Location, Event |
| **DateRange** | start, end, isApproximate | Timeline, Event |
| **Money** | amount, currency | Item, Economy |
| **Measurement** | value, unit | Item, World |
| **Name** | first, last, title, suffix | Character |
| **Description** | short, long, tags | All entities |
| **Metadata** | version, status, dates | All entities |
| **Reference** | id, type, role | All entities |
| **Tag** | name, category | All entities |
| **Color** | hex, rgb, name | World, Magic |
| **Weight** | value, unit | Item |
| **Dimensions** | length, width, height | Item, Location |
| **Duration** | value, unit | Timeline, Magic |
| **Power** | value, unit | Magic, Technology |

## Value Object Rules
1. **Immutable**: Cannot be changed after creation
2. **Self-validating**: Validate on construction
3. **Structural equality**: Compared by field values, not identity
4. **Replaceable**: Updated by replacing the entire value object
5. **No side effects**: Operations return new instances

## Dependencies
- entities/ â€” entities that use these value objects
- metadata/ â€” metadata value objects
