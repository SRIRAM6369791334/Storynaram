# Narrative Entities Contracts

## Series, Arc, Part, Chapter, Dialogue

---

## Series Contract

### Purpose
Defines the data contract for series entities — collections of books that form a sequence.

### Entity Type
`series`

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Series ID: `series_000001` |
| `type` | string | Yes | Must be `"series"` |
| `name` | string | Yes | Series name (Title Case) |
| `description` | string | Recommended | Series summary |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Series-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags |

### Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `seriesNumber` | integer | Yes | Position in overall project |
| `totalBooks` | integer | Recommended | Planned total books |
| `genre` | array | Recommended | Genre tags |
| `timelineId` | string | Optional | Primary timeline ID |

### Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Project ID |
| `children` | 0-N | Book IDs |
| `related` | 0-N | Related entities |

### Series Validation Rules
1. `id` must match `^series_[0-9]{6,}$`
2. `totalBooks` must be positive if provided

### Series Example
```json
{
  "id": "series_000001",
  "type": "series",
  "name": "The Eldorian Saga",
  "description": "An epic fantasy series set in the world of Eldoria",
  "metadata": { "version": 1, "status": "draft", "createdAt": "2026-07-17T12:00:00Z", "updatedAt": "2026-07-17T12:00:00Z" },
  "data": { "seriesNumber": 1, "totalBooks": 5, "genre": ["fantasy", "epic"] },
  "relationships": { "parent": null, "children": ["book_000001"], "related": [] },
  "tags": ["epic-fantasy", "series"]
}
```

### Lifecycle
`planning` → `active` → `completed` → `archived`

### ID Format
`series_000001`

---

## Arc Contract

### Purpose
Defines the data contract for narrative arcs — story threads that span multiple chapters or books.

### Entity Type
`arc`

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Arc ID: `arc_000001` |
| `type` | string | Yes | Must be `"arc"` |
| `name` | string | Yes | Arc name (Title Case) |
| `description` | string | Recommended | Arc description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Arc-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags |

### Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `arcType` | string | Yes | character, plot, thematic, romance, mystery |
| `chapters` | array | Recommended | Chapter IDs in this arc |
| `characters` | array | Recommended | Character IDs involved |
| `status` | string | Recommended | planned, active, resolved, archived |

### Arc Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Book ID |
| `children` | 0-N | Chapter IDs |
| `related` | 0-N | Related characters and events |

### Arc Validation Rules
1. arcType must be a valid arc type
2. Referenced chapters must exist

### Lifecycle
`planned` → `active` → `resolved` → `archived`

### ID Format
`arc_000001`

---

## Part Contract

### Purpose
Defines the data contract for book parts — major divisions within a book (e.g., Part One, Part Two).

### Entity Type
`part`

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Part ID: `part_000001` |
| `type` | string | Yes | Must be `"part"` |
| `name` | string | Yes | Part name or number |
| `description` | string | Optional | Part summary |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Part-specific data |
| `relationships` | object | Yes | Relationship references |

### Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `partNumber` | integer | Yes | Sequential part number |
| `chapterCount` | integer | Optional | Number of chapters |

### Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 1 | Book ID |
| `children` | 0-N | Chapter IDs |
| `related` | 0-N | Related entities |

### Part Validation Rules
1. partNumber must be positive
2. `id` must match `^part_[0-9]{6,}$`

### Lifecycle
`planned` → `outlined` → `written` → `revised` → `complete`

### ID Format
`part_000001`

---

## Dialogue Contract

### Purpose
Defines the data contract for dialogue entities — individual character speech within a scene.

### Entity Type
`dialogue`

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Dialogue ID: `dialogue_000001` |
| `type` | string | Yes | Must be `"dialogue"` |
| `name` | string | Yes | Dialogue label |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Dialogue-specific data |
| `relationships` | object | Yes | Relationship references |

### Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `speakerId` | string | Yes | Character ID speaking |
| `lineNumber` | integer | Yes | Sequential line number |
| `text` | string | Yes | Dialogue text |
| `direction` | string | Optional | Stage direction |
| `emotion` | string | Optional | Associated emotion |
| `language` | string | Optional | In-universe language |

### Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 1 | Scene ID |
| `children` | 0-N | Sub-dialogue (rare) |
| `related` | 0-N | Related entities |

### Dialogue Validation Rules
1. lineNumber must be positive
2. speakerId must reference an existing character
3. Text must be non-empty

### Dialogue Lifecycle
`drafted` → `revised` → `final`

### Lifecycle
`drafted` → `revised` → `final`

### ID Format
`dialogue_000001`
