# Entities Directory

## Purpose
The complete Entity Catalog for Storynaram. Every domain object that can exist in the system is defined here with its purpose, attributes, responsibilities, and relationships.

## Responsibility
Defines every entity type in the Story Operating System. Each entity has a formal specification â€” its identity, attributes, lifecycle, relationships, validation rules, and behavioral contracts.

## Entity Definition Template
Every entity file follows this structure:
`markdown
# EntityName

## Classification
- **Type**: Entity / Value Object / Aggregate Root
- **Bounded Context**: ContextName
- **Aggregate Root**: ParentAggregate (if applicable)
- **Inherits From**: ParentEntity (if applicable)

## Purpose
Why this entity exists.

## Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|

## Relationships
| Relation | Target | Cardinality | Description |
|----------|--------|-------------|-------------|

## Lifecycle
States and transitions.

## Validation Rules
Rules that govern this entity.

## Dependencies
What this entity depends on.

## See Also
Related entities.
`

## Entity Coverage
- **Narrative**: Project, Series, Book, Part, Volume, Arc, Chapter, Scene, Paragraph, Dialogue
- **Characters**: Character, Hero, Heroine, Villain, NPC, Creature, Monster, Spirit, God
- **World**: Race, Species, Language, Culture, Religion, Location types, Geography
- **Organizations**: Organization, Guild, Army, Family, House, Clan
- **Timeline**: Timeline, Era, Calendar, Event, War, Prophecy, Quest, Mission
- **Magic**: Magic, Spell, Skill, Ability
- **Items**: Weapon, Armor, Artifact, Treasure, Currency, Food, Medicine
- **Technology**: Technology, Vehicle, Document, Letter
- **Media**: Map, Image, Reference
- **System**: Tag, Note, Memory, Rule, Canon, Glossary

## Naming Convention
PascalCase.md â€” one file per entity type.

## Dependencies
- core/contracts/ â€” entity data contracts
- inheritance/ â€” entity inheritance hierarchy
- relationships/ â€” entity relationship matrix
- lifecycles/ â€” entity lifecycle definitions
- bounded_contexts/ â€” entity context mapping
