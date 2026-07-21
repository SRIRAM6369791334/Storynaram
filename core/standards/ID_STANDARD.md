# ID Standard

## Purpose
Defines the global unique identifier system for all entities in Storynaram. Every entity across all domains receives a globally unique, permanent ID.

## ID Format
`
{prefix}_{sequence}
`

- **prefix**: 2-5 lowercase alphabetic characters identifying the domain
- **separator**: single underscore _
- **sequence**: zero-padded decimal number, minimum 6 digits

## Domain Prefixes

### Characters
| Prefix | Entity Type |
|--------|-------------|
| hero | Hero characters |
| heroine | Heroine characters |
| illain | Villain characters |
| ntihero | Antihero characters |
| support | Supporting characters |
| civilian | Civilian characters |
| uler | Ruler characters |
| god | Divine entities |
| monster | Monster entities |
| creature | Creature entities |
| spirit | Spirit entities |
| amily | Family tree nodes |
| elation | Relationship entries |
| genealogy | Genealogy records |
| emotion | Emotion profiles |
| personality | Personality profiles |
| bility | Ability definitions |
| inventory | Inventory entries |
| injury | Injury records |
| memory | Character memories |
| death | Death records |

### World
| Prefix | Entity Type |
|--------|-------------|
| world | World root definitions |
| continent | Continent entities |
| country | Country entities |
| kingdom | Kingdom entities |
| empire | Empire entities |
| state | State entities |
| province | Province entities |
| district | District entities |
| city | City entities |
| illage | Village entities |
| orest | Forest entities |
| mountain | Mountain entities |
| iver | River entities |
| ocean | Ocean entities |
| island | Island entities |
| cave | Cave entities |
| dungeon | Dungeon entities |
| landmark | Landmark entities |
| map | Map entities |
| climate | Climate zone entities |
| weather | Weather pattern entities |
| ecology | Ecology zone entities |
| physics | Physics rule entities |

### Timeline
| Prefix | Entity Type |
|--------|-------------|
| 	imeline | Timeline root |
| era | Era definitions |
| calendar | Calendar definitions |
| event | Event records |
| war | War definitions |
| disaster | Disaster records |
| evolution | Revolution records |
| discovery | Discovery records |
| prophecy | Prophecy definitions |
| uture | Future event records |
| history | Historical records |

### Organizations
| Prefix | Entity Type |
|--------|-------------|
| org_kingdom | Kingdom organizational entities |
| guild | Guild entities |
| clan | Clan entities |
| 	ribe | Tribe entities |
| rmy | Army entities |
| eligion | Religious organization entities |
| secret | Secret society entities |
| government | Government entities |
| company | Company entities |

### Other Domains
| Prefix | Entity Type |
|--------|-------------|
| location | Location entities |
| eligion | Religion entities |
| language | Language entities |
| species | Species entities |
| ace | Race entities |
| magic_sys | Magic system entities |
| magic_element | Magic element entities |
| spell | Spell entities |
| magic_skill | Magic skill entities |
| curse | Curse entities |
| lessing | Blessing entities |
| rtifact | Artifact entities |
| magic_school | Magic school entities |
| 	ech_weapon | Weapon technology entities |
| machine | Machine entities |
| ehicle | Vehicle entities |
| communication | Communication technology entities |
| medicine | Medicine technology entities |
| invention | Invention entities |
| item_weapon | Weapon item entities |
| rmor | Armor item entities |
| potion | Potion item entities |
| 	reasure | Treasure item entities |
| elic | Relic item entities |
| ook | Book item entities |
| document | Document item entities |
| currency | Currency item entities |
| ood | Food item entities |
| lore | Lore entities |
| myth | Mythology entities |
| legend | Legend entities |
| olklore | Folklore entities |
| symbol | Symbol entities |
| 	radition | Tradition entities |
| estival | Festival entities |
| itual | Ritual entities |

### Narrative
| Prefix | Entity Type |
|--------|-------------|
| ook | Book entities (zero-padded: ook_000001) |
| chapter | Chapter entities |
| scene | Scene entities |
| dialogue | Dialogue entries |
| plot_main | Main plot entities |
| plot_side | Side plot entities |
| mystery | Mystery entities |
| 	wist | Twist entities |
| ending | Ending entities |

### Config and Core
| Prefix | Entity Type |
|--------|-------------|
| config | Configuration entities |
| schema | Schema entities |
| 	emplate | Template entities |
| prompt | Prompt entities |
| 
ote | Note entities |
| eview | Review entities |
| eference | Reference entities |
| esearch | Research entities |

## ID Examples
`
hero_000001
villain_000042
city_001024
event_999999
book_000001
chapter_000001
scene_000001
spell_000007
artifact_000013
`

## ID Rules
1. **Globally unique** â€” no two entities anywhere may share an ID
2. **Permanent** â€” once assigned, an ID is never reused or reassigned
3. **Immutable** â€” ID never changes after creation
4. **Sequential** â€” within a prefix, IDs increment by 1
5. **Zero-padded** â€” minimum 6 digits: _000001 through _999999
6. **Gap-tolerant** â€” gaps in sequences are acceptable (deleted entities leave gaps)

## ID Generation
- IDs are generated by scripts/generators/id_generator.ps1
- Manual ID generation is permitted following the format rules
- Never reuse an ID from a deleted/archived entity
- Archive records maintain the original ID

## ID References
- When referencing an entity, always use the full ID string
- Never truncate or abbreviate IDs in references
- References are stored in the entity's elationships block
- See REFERENCE_STANDARD.md for reference types
