# Technology Contract

## Purpose
Defines the data contract for all technology entities in Storynaram — weapons, machines, vehicles, communication devices, medicine, and inventions.

## Entity Type
`technology`

## Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Technology entity ID matching type prefix |
| `type` | string | Yes | Must be `"technology"` |
| `name` | string | Yes | Technology display name |
| `description` | string | Recommended | Description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Technology-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags per TAG_STANDARD |

## Data Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `techType` | string | Yes | weapon, machine, vehicle, communication, medicine, invention, energy, construction |
| `tier` | string | Recommended | primitive, medieval, renaissance, industrial, modern, futuristic, magical |
| `invented` | object | Optional | Invention information |
| `invented.year` | integer | Optional | Year of invention |
| `invented.by` | string | Optional | Inventor character ID |
| `materials` | array | Optional | Required materials |
| `energySource` | string | Optional | How the technology is powered |
| `complexity` | string | Optional | simple, moderate, complex, extremely-complex |
| `prevalence` | string | Optional | ubiquitous, common, uncommon, rare, unique, lost |
| `cost` | object | Optional | Production/acquisition cost |
| `cost.amount` | number | Optional | Cost value |
| `cost.currency` | string | Optional | Currency type ID |

## Type-Specific Fields

### Vehicle
| Field | Type | Description |
|-------|------|-------------|
| `vehicleType` | string | land, water, air, space, hybrid |
| `speed` | string | Maximum speed |
| `capacity` | string | Passenger/cargo capacity |
| `propulsion` | string | Propulsion method |

### Machine
| Field | Type | Description |
|-------|------|-------------|
| `purpose` | string | Primary function |
| `mechanism` | string | Operating mechanism |
| `power` | string | Power source and consumption |

### Communication
| Field | Type | Description |
|-------|------|-------------|
| `range` | string | Operational range |
| `medium` | string | Communication medium |
| `encryption` | boolean | Whether encryption is available |

## Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Parent technology or category |
| `children` | 0-N | Sub-technologies or variants |
| `related` | 0-N | Related entities (inventors, locations, events) |

## Validation Rules
1. ID prefix must match technology type: `tech_weapon`, `tech_machine`, `tech_vehicle`, `tech_communication`, `tech_medicine`, `tech_invention`, `tech_energy`, `tech_construction`
2. Tier, complexity, and prevalence must be valid enum values
3. Referenced inventor and currency must exist
4. If technology is magical-tier, magic system reference is recommended

## Lifecycle
`concept` → `prototype` → `production` → `obsolete` → `archived`

## Example
```json
{
  "id": "tech_vehicle_000001",
  "type": "technology",
  "name": "Sky Schooner",
  "description": "A magitech airship powered by bound air elementals",
  "metadata": {
    "version": 1,
    "status": "draft",
    "createdAt": "2026-07-17T12:00:00Z",
    "updatedAt": "2026-07-17T12:00:00Z"
  },
  "data": {
    "techType": "vehicle",
    "tier": "magical",
    "invented": {
      "year": 1234,
      "by": "character_000042"
    },
    "materials": ["ironwood", "elemental-binder", "silk"],
    "energySource": "bound air elemental",
    "complexity": "complex",
    "prevalence": "rare",
    "vehicleType": "air",
    "speed": "30 knots",
    "capacity": "20 passengers, 5 tons cargo",
    "propulsion": "wind sails + elemental thrust"
  },
  "relationships": {
    "parent": null,
    "children": [],
    "related": ["magic_sys_000001", "city_000001"]
  },
  "tags": ["airship", "magitech", "transport"]
}
```
