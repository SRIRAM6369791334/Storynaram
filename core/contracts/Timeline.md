# Timeline Contract

## Purpose
Defines the data contract for all timeline entities in Storynaram — events, eras, wars, discoveries, prophecies.

## Entity Type
`timeline`

## Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Timeline entity ID |
| `type` | string | Yes | Must match timeline prefix type |
| `name` | string | Yes | Event/era name (Title Case) |
| `description` | string | Recommended | Event description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Timeline-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags per TAG_STANDARD |

## Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date.year` | integer | Yes | Year (positive = CE, negative = BCE) |
| `date.month` | integer | Optional | Month (1-12) |
| `date.day` | integer | Optional | Day (1-31) |
| `date.calendar` | string | Optional | Calendar system ID |
| `date.duration` | object | Optional | Event duration |
| `date.isApproximate` | boolean | Optional | True if approximate |
| `significance` | string | Recommended | Historical significance |
| `impact` | string | Optional | Impact description |
| `participants` | array | Optional | Character IDs involved |
| `location` | string | Optional | Location ID |

## Event Types (by ID prefix)
`event_*` — General events | `war_*` — Wars | `disaster_*` — Disasters | `revolution_*` — Revolutions | `discovery_*` — Discoveries | `prophecy_*` — Prophecies | `future_*` — Future events | `history_*` — Historical records

## Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Parent era or calendar |
| `children` | 0-N | Sub-events |
| `related` | 0-N | Related entities |

## Validation Rules
1. ID prefix must match event type
2. Date format must be valid
3. Duration must be non-negative
4. Prophecy fulfillment date must be after prophecy date

## Lifecycle (Event)
`proposed` → `planned` → `occurring` → `resolved` → `canon` → `archived`

## Lifecycle (Timeline Root)
`draft` → `active` → `frozen` → `archived`

## Example
```json
{
  "id": "event_000001",
  "type": "event",
  "name": "Coronation of King Aldric III",
  "metadata": {
    "version": 1,
    "status": "final",
    "createdAt": "2026-07-17T12:00:00Z",
    "updatedAt": "2026-07-17T12:00:00Z"
  },
  "data": {
    "date": {
      "year": 1247,
      "month": 6,
      "day": 21,
      "isApproximate": false
    },
    "significance": "Restoration of the Stormwind dynasty",
    "participants": ["hero_000001", "support_000003"],
    "location": "city_000001"
  },
  "relationships": {
    "parent": "era_000001",
    "children": [],
    "related": ["book_000001"]
  },
  "tags": ["coronation", "political", "climax"]
}
```
