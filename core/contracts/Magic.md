# Magic Contract

## Purpose
Defines the data contract for all magic entities in Storynaram — magic systems, elements, spells, skills, curses, blessings, artifacts, and schools.

## Entity Type
`magic`

## Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Magic entity ID matching type prefix |
| `type` | string | Yes | Must be `"magic"` |
| `name` | string | Yes | Magic entity display name |
| `description` | string | Recommended | Description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Magic-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags per TAG_STANDARD |

## Data Fields (Common)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `magicType` | string | Yes | system, element, spell, skill, curse, blessing, artifact, school |
| `powerLevel` | string | Optional | minor, moderate, major, legendary, primordial |
| `cost` | string | Optional | Magical cost (mana, life force, etc.) |
| `difficulty` | string | Optional | novice, intermediate, advanced, master, legendary |

## Type-Specific Fields

### Spell
| Field | Type | Description |
|-------|------|-------------|
| `school` | string | Magic school ID |
| `element` | string | Magic element ID |
| `incantation` | string | Verbal component |
| `components` | array | Required material components |
| `effect` | string | Spell effect description |
| `range` | string | self, touch, close, medium, far, line-of-sight |
| `duration` | string | instantaneous, concentration, timed, permanent |
| `cooldown` | string | Time before spell can be cast again |

### Artifact
| Field | Type | Description |
|-------|------|-------------|
| `powers` | array | Magical powers |
| `origin` | string | How the artifact was created |
| `creator` | string | Creator character ID |
| `currentKeeper` | string | Current keeper character ID |
| `destruction` | string | How the artifact can be destroyed |

### Skill
| Field | Type | Description |
|-------|------|-------------|
| `skillType` | string | Type of magical skill |
| `levelRequirement` | integer | Minimum level to use |
| `prerequisites` | array | Required prior skills |

### Ability
| Field | Type | Description |
|-------|------|-------------|
| `origin` | string | innate, learned, granted, cursed |
| `cooldown` | string | Recharge time |
| `isPassive` | boolean | Whether ability is always active |

### Curse
| Field | Type | Description |
|-------|------|-------------|
| `effect` | string | Curse effect description |
| `removal` | string | How the curse can be removed |
| `creator` | string | Who created the curse |

### Blessing
| Field | Type | Description |
|-------|------|-------------|
| `effect` | string | Blessing effect |
| `source` | string | Divine or magical source |
| `duration` | string | How long the blessing lasts |

### Element
| Field | Type | Description |
|-------|------|-------------|
| `domain` | string | Elemental domain (fire, water, etc.) |
| `alignment` | string | Alignment tendencies |
| `affinities` | array | Related elements |

## Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Parent magic system/school |
| `children` | 0-N | Sub-spells or components |
| `related` | 0-N | Related entities |

## Validation Rules
1. ID prefix must match magic type: `magic_sys`, `magic_element`, `spell`, `magic_skill`, `curse`, `blessing`, `artifact`, `magic_school`
2. Referenced schools, elements, and creators must exist
3. Power level and difficulty must be valid enum values
4. Spell cooldown must be non-negative

## Lifecycle
`draft` → `active` → `restricted` → `lost` → `archived`

## Example
```json
{
  "id": "spell_000001",
  "type": "magic",
  "name": "Fireball",
  "description": "A classic evocation spell that launches a ball of fire",
  "metadata": {
    "version": 1,
    "status": "draft",
    "createdAt": "2026-07-17T12:00:00Z",
    "updatedAt": "2026-07-17T12:00:00Z"
  },
  "data": {
    "magicType": "spell",
    "school": "magic_school_000001",
    "element": "magic_element_000001",
    "incantation": "Ignis volat",
    "components": ["sulfur", "bat guano"],
    "effect": "Creates a 20ft radius explosion of fire",
    "range": "medium",
    "duration": "instantaneous",
    "cooldown": "1 round",
    "powerLevel": "moderate",
    "difficulty": "intermediate",
    "cost": "10 mana"
  },
  "relationships": {
    "parent": "magic_sys_000001",
    "children": [],
    "related": ["character_000001"]
  },
  "tags": ["evocation", "fire", "combat"]
}
```
