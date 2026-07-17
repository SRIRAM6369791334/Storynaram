# Item Contract

## Purpose
Defines the data contract for all item entities in Storynaram — weapons, armor, potions, treasures, relics, books, documents, currencies, and food.

## Entity Type
`item`

## Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Item ID matching item type prefix |
| `type` | string | Yes | Must be `"item"` |
| `name` | string | Yes | Item display name (Title Case) |
| `description` | string | Recommended | Item description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Item-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags per TAG_STANDARD |

## Data Fields (Common)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Item subtype: weapon, armor, potion, treasure, relic, book, document, currency, food |
| `material` | string | Optional | Primary material |
| `weight` | number | Optional | Weight in kg |
| `value` | object | Optional | Monetary value |
| `value.amount` | number | Optional | Numeric value |
| `value.currency` | string | Optional | Currency type ID |
| `condition` | string | Optional | pristine, good, worn, damaged, broken |
| `owner` | string | Optional | Current owner character ID |
| `location` | string | Optional | Current location ID |
| `history` | string | Optional | Notable historical information |
| `magical` | boolean | Optional | Whether item is magical |
| `rarity` | string | Optional | common, uncommon, rare, very-rare, legendary, unique |

## Item Type-Specific Fields

### Weapon
| Field | Type | Description |
|-------|------|-------------|
| `weaponType` | string | sword, axe, bow, staff, dagger, spear, mace, etc. |
| `damage` | string | Damage description |
| `range` | string | melee, ranged, both |

### Armor
| Field | Type | Description |
|-------|------|-------------|
| `armorType` | string | light, medium, heavy, shield |
| `defense` | string | Defense description |

### Potion
| Field | Type | Description |
|-------|------|-------------|
| `effect` | string | Potion effect description |
| `duration` | string | Effect duration |
| `quantity` | integer | Number of doses remaining |

### Treasure
| Field | Type | Description |
|-------|------|-------------|
| `treasureType` | string | coins, gems, jewelry, art, commodity |
| `origin` | string | Origin or mint |

### Relic
| Field | Type | Description |
|-------|------|-------------|
| `era` | string | Historical era of origin |
| `significance` | string | Cultural or historical significance |
| `powers` | array | Magical properties if any |

## Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Container entity (chest, location, inventory) |
| `children` | 0-N | Component items |
| `related` | 0-N | Related entities (characters, events, locations) |

## Validation Rules
1. ID prefix must match item type: `item_weapon`, `item_armor`, `item_potion`, `item_treasure`, `item_relic`, `item_book`, `item_document`, `item_currency`, `item_food`, `item_medicine`
2. `rarity` must be a valid enum value
3. `condition` must be a valid condition value
4. If `magical` is true, a magic system reference is recommended
5. Referenced owner and location must exist

## Lifecycle
`draft` → `available` → `owned` → `consumed` | `destroyed` → `archived`

## Example
```json
{
  "id": "item_weapon_000001",
  "type": "item",
  "name": "Stormbreaker",
  "description": "A legendary sword forged in dragonfire",
  "metadata": {
    "version": 1,
    "status": "draft",
    "createdAt": "2026-07-17T12:00:00Z",
    "updatedAt": "2026-07-17T12:00:00Z"
  },
  "data": {
    "type": "weapon",
    "weaponType": "sword",
    "material": "dragonsteel",
    "weight": 3.5,
    "damage": "2d8 slashing",
    "range": "melee",
    "condition": "pristine",
    "rarity": "legendary",
    "magical": true
  },
  "relationships": {
    "parent": null,
    "children": [],
    "related": ["hero_000001", "event_000005"]
  },
  "tags": ["legendary", "weapon", "sword", "magical"]
}
```
