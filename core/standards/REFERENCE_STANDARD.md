# Reference Standard

## Purpose
Defines the cross-entity reference system for Storynaram. References are how entities link to each other without duplicating data.

## Reference Format
References are always the target entity's full ID as a string:
```json
"hero_000001"
```

Or in relationship blocks:
```json
{
  "relationships": {
    "parent": "book_000001",
    "children": ["chapter_000001", "chapter_000002"],
    "related": ["location_000001", "event_000042"]
  }
}
```

## Reference Types

### Direct Reference
```json
"currentLocation": "city_000001"
```

### Array Reference
```json
"characters": ["hero_000001", "heroine_000002", "villain_000003"]
```

### Typed Reference
```json
{
  "id": "hero_000001",
  "type": "character",
  "role": "protagonist"
}
```

## Reference Fields
| Field | Type | Description |
|-------|------|-------------|
| `parent` | string or null | Single parent entity ID |
| `children` | array of strings | Child entity IDs |
| `related` | array of strings | Related entity IDs |
| `references` | array of strings | Source/reference entity IDs |

## Cross-Reference Rules

### Character References
| Reference | Target | Cardinality |
|-----------|--------|-------------|
| Character → Scene | `scene_XXXXXX` | Many-to-many |
| Character → Chapter | `chapter_XXXXXX` | Many-to-many |
| Character → Book | `book_XXXXXX` | Many-to-many |
| Character → Event | `event_XXXXXX` | Many-to-many |
| Character → Location | `location_XXXXXX` | Many-to-many |
| Character → Organization | `guild_XXXXXX` | Many-to-many |
| Character → Family | `family_XXXXXX` | Many-to-one |

### World References
| Reference | Target | Cardinality |
|-----------|--------|-------------|
| City → Country | `country_XXXXXX` | Many-to-one |
| City → Kingdom | `kingdom_XXXXXX` | Many-to-one |
| Country → Kingdom | `kingdom_XXXXXX` | Many-to-one |
| Kingdom → Empire | `empire_XXXXXX` | Many-to-one |
| Province → Country | `country_XXXXXX` | Many-to-one |
| Village → District | `district_XXXXXX` | Many-to-one |

### Timeline References
| Reference | Target | Cardinality |
|-----------|--------|-------------|
| Event → Era | `era_XXXXXX` | Many-to-one |
| Event → Location | `location_XXXXXX` | Many-to-one |
| Event → Characters | `hero_XXXXXX` | Many-to-many |
| War → Events | `event_XXXXXX` | One-to-many |

### Narrative References
| Reference | Target | Cardinality |
|-----------|--------|-------------|
| Book → Characters | `hero_XXXXXX` | One-to-many |
| Chapter → Book | `book_XXXXXX` | Many-to-one |
| Scene → Chapter | `chapter_XXXXXX` | Many-to-one |
| Scene → Location | `location_XXXXXX` | Many-to-one |
| Plot → Book | `book_XXXXXX` | Many-to-one |

## Bidirectional Reference Rule
When entity A references entity B, entity B should include an inverse reference to entity A when feasible.

## Reference Validation Rules
1. Every reference must point to an existing entity ID
2. References must match the expected type
3. Circular references are allowed but must be intentional
4. Orphaned references (pointing to archived entities) are not allowed
5. Reference arrays cannot contain duplicates
