# Aggregates Directory

## Purpose
Defines Aggregate Roots and their boundaries in the Storynaram domain model.

## Responsibility
Identifies aggregate roots and defines transaction boundaries. Aggregates ensure consistency boundaries â€” changes within an aggregate are atomic, while cross-aggregate changes use eventual consistency.

## Aggregate Roots
| Aggregate Root | Entities Within | Repository |
|----------------|-----------------|------------|
| **Project** | Series, Book, Config | ProjectRepository |
| **Book** | Chapter, Scene, Dialogue | BookRepository |
| **Character** | Hero, Villain, NPC, relationships | CharacterRepository |
| **World** | Location, Geography, Climate | WorldRepository |
| **Timeline** | Event, Era, Calendar | TimelineRepository |
| **Organization** | Guild, Army, House | OrganizationRepository |
| **Magic** | Spell, Skill, Ability | MagicRepository |
| **Item** | Weapon, Armor, Artifact | ItemRepository |

## Aggregate Rules
1. **Identity boundary**: Each aggregate has a root with global identity
2. **Consistency boundary**: Internal consistency is maintained within the aggregate
3. **Reference by ID**: External entities reference aggregate roots by ID only
4. **Transactional**: Changes to an aggregate are atomic
5. **Persistence**: Aggregates are the unit of persistence

## Dependencies
- entities/ â€” entities that belong to each aggregate
- repositories/ â€” repository per aggregate root
- relationships/ â€” cross-aggregate relationships
