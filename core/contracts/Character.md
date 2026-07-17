# Character Contract

## Purpose
Defines the data contract for all character entities in Storynaram. Every character — hero, villain, supporting, civilian, god, monster — must conform to this contract.

## Entity Type
`character`

## Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Globally unique character ID per ID_STANDARD |
| `type` | string | Yes | Must be `"character"` |
| `name` | string | Yes | Character display name (Title Case) |
| `description` | string | Recommended | Brief character summary |
| `metadata` | object | Yes | Standard metadata block per METADATA_STANDARD |
| `data` | object | Yes | Character-specific data |
| `relationships` | object | Yes | Relationship references per REFERENCE_STANDARD |
| `tags` | array | Recommended | Tags per TAG_STANDARD |

## Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | Recommended | Character's first name |
| `lastName` | string | Recommended | Character's last name |
| `titles` | array | Optional | Honorifics and titles |
| `aliases` | array | Optional | Nicknames and aliases |
| `age` | integer | Recommended | Age in years |
| `birthDate` | string | Optional | Date of birth (ISO 8601) |
| `deathDate` | string or null | Optional | Date of death (null if immortal) |
| `gender` | string | Recommended | Gender identity |
| `race` | string | Recommended | Race ID reference |
| `species` | string | Recommended | Species ID reference |
| `occupation` | string | Optional | Primary occupation |
| `origin` | string | Recommended | Birthplace location ID |
| `currentLocation` | string | Recommended | Current location ID |
| `organization` | string | Optional | Primary organization ID |
| `family` | string | Optional | Family tree ID |

## Relationships
| Field | Type | Cardinality | Description |
|-------|------|-------------|-------------|
| `parent` | Reference or null | 0-1 | Family parent entity |
| `children` | array | 0-N | Family children entities |
| `related` | array | 0-N | Related entities (scenes, events, items) |

## Validation Rules
1. ID must match `^(hero|heroine|villain|antihero|support|civilian|ruler|npc|god|monster|creature|spirit)_[0-9]{6,}$`
2. `type` must be `"character"`
3. If `deathDate` is set, it must be after `birthDate`
4. Referenced entities must exist
5. Tags must match TAG_STANDARD taxonomy

## Lifecycle
`draft → review → revised → final → published → archived`

## Example
```json
{
  "id": "hero_000001",
  "type": "character",
  "name": "King Aldric Stormwind III",
  "description": "The rightful heir to the throne of Eldoria",
  "metadata": {
    "version": 1,
    "status": "draft",
    "createdAt": "2026-07-17T12:00:00Z",
    "updatedAt": "2026-07-17T12:00:00Z"
  },
  "data": {
    "firstName": "Aldric",
    "lastName": "Stormwind",
    "titles": ["King of Eldoria"],
    "age": 34,
    "gender": "male",
    "race": "race_000001",
    "species": "species_000001",
    "occupation": "Monarch",
    "origin": "city_000001",
    "currentLocation": "city_000042"
  },
  "relationships": {
    "parent": "family_000001",
    "children": [],
    "related": ["scene_000001", "event_000005"]
  },
  "tags": ["protagonist", "human", "royalty", "draft"]
}
```
