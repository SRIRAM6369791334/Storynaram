# World Contract

## Purpose
Defines the data contract for all world entities in Storynaram. Every geographical, physical, and ecological entity must conform to this contract.

## Entity Type
`world`

## Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Globally unique world ID per ID_STANDARD |
| `type` | string | Yes | Must be appropriate world type prefix |
| `name` | string | Yes | Entity display name (Title Case) |
| `description` | string | Recommended | Brief description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | World-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags per TAG_STANDARD |

## Data Fields (Common to All World Types)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `coordinates` | object | Optional | Geographical coordinates |
| `coordinates.latitude` | number | Optional | Latitude |
| `coordinates.longitude` | number | Optional | Longitude |
| `coordinates.elevation` | number | Optional | Elevation in meters |
| `area` | number | Optional | Area in square kilometers |
| `population` | integer | Optional | Population count |
| `capital` | string | Optional | Capital location ID |
| `language` | array | Optional | Primary language IDs |
| `currency` | string | Optional | Primary currency ID |

## World Type-Specific Fields

### Continent
| Field | Type | Description |
|-------|------|-------------|
| `countries` | array | Countries within this continent |
| `climate` | string | Primary climate zone |

### Country
| Field | Type | Description |
|-------|------|-------------|
| `continent` | string | Parent continent ID |
| `government` | string | Government type |
| `ruler` | string | Current ruler character ID |

### Province
| Field | Type | Description |
|-------|------|-------------|
| `country` | string | Parent country ID |
| `ruler` | string | Provincial ruler character ID |
| `resources` | array | Natural resources |

### District
| Field | Type | Description |
|-------|------|-------------|
| `province` | string | Parent province ID |
| `type` | string | administrative, commercial, residential, industrial, rural |

### City
| Field | Type | Description |
|-------|------|-------------|
| `country` | string | Parent country ID |
| `kingdom` | string | Parent kingdom ID (if applicable) |
| `mayor` | string | Mayor/ruler character ID |
| `districts` | integer | Number of districts |
| `defenses` | string | Defensive capabilities |
| `economy` | string | Primary economic activity |

### Village
| Field | Type | Description |
|-------|------|-------------|
| `district` | string | Parent district ID |
| `population` | integer | Population count |
| `industry` | string | Primary industry |

### Location (specific point of interest)
| Field | Type | Description |
|-------|------|-------------|
| `parentType` | string | Type of parent (city, district, continent) |
| `parentId` | string | Parent entity ID |
| `locationType` | string | castle, temple, forest, mountain, river, ocean, island, cave, dungeon, landmark |
| `coordinates` | object | Precise coordinates |

## Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Parent geographical entity |
| `children` | 0-N | Child geographical entities |
| `related` | 0-N | Related entities (events, characters, locations) |

## Validation Rules
1. ID prefix must match world type: `world`, `continent`, `country`, `province`, `district`, `city`, `village`, `location`, `kingdom`, `empire`
2. `type` must match the ID prefix domain
3. Coordinate values must be valid (-90 to 90 for latitude, -180 to 180 for longitude)
4. Area and population must be non-negative
5. Referenced entities must exist
6. Hierarchical relationships must be geographically valid

## Lifecycle
`draft` → `development` → `final` → `frozen` → `archived`

## Example
```json
{
  "id": "continent_000001",
  "type": "continent",
  "name": "Eldoria",
  "description": "The central continent of the known world",
  "metadata": {
    "version": 1,
    "status": "draft",
    "createdAt": "2026-07-17T12:00:00Z",
    "updatedAt": "2026-07-17T12:00:00Z"
  },
  "data": {
    "area": 4500000,
    "climate": "temperate",
    "countries": ["country_000001", "country_000002"]
  },
  "relationships": {
    "parent": "world_000001",
    "children": ["country_000001", "country_000002"],
    "related": []
  },
  "tags": ["continent", "central", "temperate"]
}
```
