# Book Contract

## Purpose
Defines the data contract for book entities in Storynaram. Each book in the series is a top-level narrative container.

## Entity Type
`book`

## Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Book ID: `book_000001` format |
| `type` | string | Yes | Must be `"book"` |
| `name` | string | Yes | Book title (Title Case) |
| `description` | string | Recommended | Book blurb/summary |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Book-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags per TAG_STANDARD |

## Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subtitle` | string | Optional | Book subtitle |
| `series` | string | Optional | Series name |
| `seriesNumber` | integer | Recommended | Position in series |
| `wordCount` | integer | Optional | Target or actual word count |
| `chapterCount` | integer | Optional | Number of chapters |
| `pov` | string | Optional | Primary POV character ID |
| `setting` | string | Optional | Primary setting location ID |
| `genre` | array | Recommended | Genre tags |
| `themes` | array | Optional | Major themes |
| `status` | string | Yes | Book status enum value |

## Book Status
`outline` | `draft` | `revision` | `beta` | `editing` | `ready` | `published` | `archived`

## Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | null | Books have no parent |
| `children` | 0-N | Chapter IDs |
| `related` | 0-N | Related entities |

## Validation Rules
1. `id` must match `^book_[0-9]{6,}$`
2. `type` must be `"book"`
3. `seriesNumber` must be positive if provided
4. Referenced chapter IDs must exist
5. Genre and theme tags must match TAG_STANDARD taxonomy

## Lifecycle
`outline` → `draft` → `revision` → `beta` → `editing` → `ready` → `published` → `archived`

## Example
```json
{
  "id": "book_000001",
  "type": "book",
  "name": "The Crystal Throne",
  "metadata": {
    "version": 1,
    "status": "draft",
    "createdAt": "2026-07-17T12:00:00Z",
    "updatedAt": "2026-07-17T12:00:00Z"
  },
  "data": {
    "series": "The Eldorian Saga",
    "seriesNumber": 1,
    "wordCount": 120000,
    "chapterCount": 24,
    "genre": ["fantasy", "adventure"],
    "themes": ["redemption", "leadership"],
    "status": "draft"
  },
  "relationships": {
    "parent": null,
    "children": ["chapter_000001"],
    "related": ["hero_000001", "plot_main_000001"]
  },
  "tags": ["book-1", "fantasy", "draft"]
}
```
