# Contracts Directory

## Purpose
The authoritative data contracts for every entity type in Storynaram. Each contract defines the required structure, fields, relationships, and validation rules for a domain entity.

## Responsibility
Specifies the exact data shape for every entity -- required fields, optional fields, data types, relationship fields, validation constraints, and lifecycle states. Contracts are the agreement between domains about how data is structured.

## Files
| File | Scope |
|------|-------|
| Character.md | Character entity data contract |
| World.md | World entity data contract |
| Book.md | Book entity data contract |
| Timeline.md | Timeline entity data contract |
| Scene.md | Scene entity data contract |
| Item.md | Item entity data contract |
| Organization.md | Organization entity data contract |
| Magic.md | Magic entity data contract |
| Technology.md | Technology entity data contract |
| NarrativeEntities.md | Series, Arc, Part, Dialogue contracts |
| CulturalEntities.md | Species, Race, Culture, Religion, Language, Lore contracts |
| TimelineEntities.md | Calendar, War, Battle, Prophecy, Quest contracts |
| SystemEntities.md | Note, Memory, Rule, Canon, Glossary, Reference, Map, Image, Document, Family, Relationship, Inventory contracts |

## Naming Convention
- PascalCase.md -- entity name as the filename
- Composite files for related entity groups
- Contracts are documentation-first; machine-readable versions live in schemas/

## Relationships
- **core/standards/** contracts follow all development standards
- **schemas/** (future) implements contracts as formal JSON Schema
- **templates/** (future) implements contracts as reusable templates
- **core/validators/** (future) validates entity instances against contracts
- **Every domain directory** creates files conforming to these contracts
