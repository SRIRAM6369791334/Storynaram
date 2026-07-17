# System Entities Contracts

## Note, Memory, Rule, Canon, Glossary, Reference, Map, Image, Document, Inventory, Family, Relationship

---

## Note Contract

### Entity Type `note`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `note_000001` |
| `title` | string | Yes | Note title |
| `content` | string | Yes | Note body |
| `entityRefs` | array | No | Related entity IDs |
| `tags` | array | No | Classification tags |

### Note Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Parent project |
| `children` | 0-N | Sub-notes |
| `related` | 0-N | Related entities |

### Note Validation Rules
1. Title must be non-empty
2. Content must be non-empty

### Note Example
```json
{
  "id": "note_000001",
  "title": "Plot hole in Chapter 3",
  "content": "Aldric's age inconsistency needs resolution",
  "entityRefs": ["chapter_000003", "hero_000001"],
  "tags": ["plot-hole", "continuity"]
}
```

**Lifecycle:** `draft` → `final` → `archived`

---

## Memory Contract

### Entity Type `memory`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `memory_000001` |
| `memoryType` | string | Yes | ai, character, story, system, canon |
| `content` | string | Yes | Memory content |
| `timestamp` | datetime | Yes | When memory was recorded |
| `entityRefs` | array | No | Related entity IDs |
| `importance` | float | No | 0.0 to 1.0 |
| `ttl` | string | No | session, persistent, permanent |

**Memory Types:** `ai` (AI operational memory), `character` (in-story character knowledge), `story` (narrative context), `system` (system state), `canon` (canonical records)

**Lifecycle:** `active` → `archived` → `purged`

### Memory Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Owner entity ID |
| `children` | 0-N | Related memories |
| `related` | 0-N | Related entities |

### Memory Validation Rules
1. memoryType must be one of: ai, character, story, system, canon
2. importance must be between 0.0 and 1.0
3. ttl must be one of: session, persistent, permanent

---

## Rule Contract

### Entity Type `rule`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `rule_000001` |
| `name` | string | Yes | Rule name |
| `description` | string | Yes | Rule description |
| `category` | string | Yes | writing, naming, structural, validation, ai |
| `enforcement` | string | Yes | required, recommended, optional |
| `scope` | string | No | global, per-entity, per-project |

**Lifecycle:** `draft` → `active` → `deprecated` → `archived`

### Rule Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Parent rule |
| `children` | 0-N | Sub-rules |
| `related` | 0-N | Governed entities |

### Rule Validation Rules
1. enforcement must be: required, recommended, optional

---

## Canon Contract

### Entity Type `canon`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `canon_000001` |
| `entityId` | string | Yes | Referenced entity ID |
| `entityType` | string | Yes | Entity type |
| `canonStatus` | string | Yes | draft, review, approved, locked |
| `lockedAt` | datetime | No | When locked |
| `lockedBy` | string | No | Who locked |
| `version` | int | Yes | Canon version number |
| `previousCanonId` | string | No | Previous canon record |

**Lifecycle:** `draft` → `review` → `approved` → `locked`

### Canon Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | null | Canon has no parent |
| `children` | 0-N | Sub-canons |
| `related` | 1 | Referenced entity |

### Canon Validation Rules
1. canonStatus must be: draft, review, approved, locked
2. Locked canons cannot be edited

---

## Glossary Contract

### Entity Type `glossary`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `glossary_000001` |
| `term` | string | Yes | Glossary term |
| `definition` | string | Yes | Definition |
| `category` | string | No | Term category |
| `relatedTerms` | array | No | Related term IDs |

**Lifecycle:** `draft` → `final` → `archived`

### Glossary Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Parent glossary category |
| `children` | 0-N | Related terms |
| `related` | 0-N | Entities using this term |

---

## Reference Contract

### Entity Type `reference`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `reference_000001` |
| `title` | string | Yes | Reference title |
| `refType` | string | Yes | book, article, website, image, video, personal |
| `source` | string | Yes | Source identifier |
| `url` | string | No | URL if web-based |
| `notes` | string | No | Personal notes |

**Lifecycle:** `active` → `archived`

### Reference Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | null | No parent |
| `children` | 0-N | Sub-references |
| `related` | 0-N | Referenced entities |

---

## Map Contract

### Entity Type `map`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `map_000001` |
| `name` | string | Yes | Map name |
| `mapType` | string | Yes | world, continent, country, city, dungeon, region |
| `regionId` | string | No | Geographic area ID |
| `fileReference` | string | Yes | Path to map file |

**Lifecycle:** `draft` → `final` → `archived`

### Map Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Parent map |
| `children` | 0-N | Sub-maps |
| `related` | 0-N | Related locations |

---

## Image Contract

### Entity Type `image`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `image_000001` |
| `name` | string | Yes | Image name |
| `imageType` | string | Yes | character, location, item, concept, map, reference |
| `fileReference` | string | Yes | Path to image file |
| `description` | string | No | Image description |
| `entityRefs` | array | No | Related entity IDs |

**Lifecycle:** `active` → `archived`

### Image Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Parent entity |
| `children` | 0-N | Variants |
| `related` | 0-N | Related entities |

---

## Document (In-Story) Contract

### Entity Type `document` (in-story documents)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `document_000001` |
| `title` | string | Yes | Document title |
| `content` | string | Yes | Full text content |
| `authorId` | string | No | In-story author character ID |
| `dateWritten` | object | No | In-story date |
| `languageId` | string | No | In-story language |

**Lifecycle:** `draft` → `final` → `archived`

---

## Family Contract

### Entity Type `family`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `family_000001` |
| `name` | string | Yes | Family/house name |
| `headId` | string | No | Head of family character ID |
| `members` | array | Yes | Character IDs |
| `sigil` | string | No | Heraldic symbol |
| `motto` | string | No | Family motto |
| `originId` | string | No | Origin location ID |

**Lifecycle:** `active` → `extinct` → `archived`

### Family Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Parent family/house |
| `children` | 0-N | Sub-families |
| `related` | 0-N | Related characters |

### Family Validation Rules
1. At least 1 member required

---

## Relationship Contract

### Entity Type `relationship`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `relationship_000001` |
| `sourceId` | string | Yes | Source character ID |
| `targetId` | string | Yes | Target character ID |
| `relType` | string | Yes | friendship, romance, family, rivalry, mentorship, allegiance, hatred |
| `strength` | float | No | 0.0 to 1.0 |
| `description` | string | No | Narrative description |
| `startDate` | object | No | When relationship began |
| `endDate` | object | No | When relationship ended |

**Lifecycle:** `active` → `ended` → `archived`

### Relationship Validation Rules
1. sourceId and targetId must be different characters
2. relType must be a valid relationship type
3. strength must be between 0.0 and 1.0

---

## Inventory Contract

### Entity Type `inventory`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | `inventory_000001` |
| `characterId` | string | Yes | Owner character ID |
| `itemId` | string | Yes | Item ID |
| `slot` | string | No | Equipment slot |
| `quantity` | integer | Yes | Quantity (default 1) |
| `condition` | string | No | Item condition |

**Lifecycle:** `active` → `consumed` → `removed`
