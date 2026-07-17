# Indexing Strategy

## Search, Lookup, and Retrieval Optimizations

---

## 1. Primary Indexes

| Entity | Primary Key | Index Type | Description |
|--------|------------|------------|-------------|
| All entities | entityId | Hash | Unique entity lookup |
| Book | bookId | Hash | Direct book access |
| Character | characterId | Hash | Direct character access |
| Scene | sceneId | Hash | Direct scene access |
| Event | eventId | Hash | Direct event access |
| Location | locationId | Hash | Direct location access |
| Organization | organizationId | Hash | Direct org access |
| Item | itemId | Hash | Direct item access |
| Magic | magicId | Hash | Direct magic access |
| World | worldId | Hash | Direct world access |
| Timeline | timelineId | Hash | Direct timeline access |

---

## 2. Secondary Indexes

| Entity | Indexed Field | Index Type | Purpose |
|--------|--------------|------------|---------|
| Book | seriesId | B-tree | Books by series |
| Book | status | B-tree | Books by status |
| Book | title | Full-text | Title search |
| Book | createdAt | B-tree | Sort by creation date |
| Book | updatedAt | B-tree | Sort by modification date |
| Chapter | bookId | B-tree | Chapters by book |
| Chapter | number | Composite (bookId, number) | Ordered chapter lookup |
| Scene | chapterId | B-tree | Scenes by chapter |
| Scene | characterIds | GIN | Scenes by participating character |
| Scene | locationId | B-tree | Scenes by location |
| Scene | number | Composite (chapterId, number) | Ordered scene lookup |
| Character | name | Full-text | Name search |
| Character | speciesId | B-tree | Characters by species |
| Character | raceId | B-tree | Characters by race |
| Character | archetype | B-tree | Characters by archetype |
| Character | status | B-tree | Characters by lifecycle |
| Character | bookIds | GIN | Characters by book |
| Relationship | sourceCharacterId | B-tree | Relationships by source |
| Relationship | targetCharacterId | B-tree | Relationships by target |
| Relationship | type + sourceId | Composite | Filtered relationship lookup |
| Event | eraId | B-tree | Events by era |
| Event | date | B-tree | Chronological sort |
| Event | characterIds | GIN | Events involving character |
| Event | locationId | B-tree | Events at location |
| Event | type | B-tree | Events by type |
| Location | parentId | B-tree | Child locations |
| Location | type | B-tree | Locations by type |
| Location | coordinates | GiST | Geospatial queries |
| Location | name | Full-text | Name search |
| Organization | type | B-tree | Orgs by type |
| Organization | headquartersId | B-tree | Orgs by location |
| Member | organizationId | B-tree | Members of org |
| Member | characterId | B-tree | Orgs a character belongs to |
| Spell | magicId | B-tree | Spells by magic system |
| Spell | school | B-tree | Spells by school |
| Item | type | B-tree | Items by type |
| Item | ownerId | B-tree | Items by owner |
| Item | locationId | B-tree | Items by stored location |
| Item | rarity | B-tree | Items by rarity |
| Technology | techType | B-tree | Technology by type |
| Technology | tier | B-tree | Technology by tier |
| Technology | inventorId | B-tree | Technology by inventor |

---

## 3. Full-Text Search Indexes

| Index Name | Fields Covered | Language | Weight |
|-----------|---------------|----------|--------|
| book_fts | title, subtitle, description, notes | Multi | A: title, B: subtitle, C: rest |
| character_fts | name, backstory, description, traits | Multi | A: name, B: description, C: backstory |
| scene_fts | title, summary, content, notes | Multi | A: title, B: summary, C: content |
| event_fts | name, description, outcome | Multi | A: name, B: description |
| location_fts | name, description, features | Multi | A: name, B: description |
| organization_fts | name, description, dogma | Multi | A: name, B: description |
| item_fts | name, description, lore | Multi | A: name, B: description |
| magic_fts | name, description, rules | Multi | A: name, B: description |
| spell_fts | name, effect, incantation | Multi | A: name, B: effect |
| lore_fts | title, content, significance | Multi | A: title, B: content |

---

## 4. Composite Indexes

| Index Name | Fields | Purpose |
|-----------|--------|---------|
| book_series_order | (seriesId, volumeNumber) | Ordered book listing in series |
| chapter_position | (bookId, partNumber, chapterNumber) | Ordered chapter tree |
| scene_position | (chapterId, sceneNumber) | Ordered scene tree |
| timeline_chronology | (timelineId, date) | Chronological event order |
| location_geography | (parentId, type, name) | Geographic hierarchy browsing |
| member_org_role | (organizationId, role, characterId) | Org membership by role |
| inventory_slot | (characterId, slot) | Slot-ordered inventory |
| event_participants | (eventId, characterId) | Event participation lookup |
| relationship_pair | (sourceId, targetId, type) | Unique relationship check |
| entity_status | (entityType, status) | Status-based listing |

---

## 5. Geospatial Indexes

| Entity | Index Type | Use Case |
|--------|-----------|----------|
| Location | GiST on coordinates | Proximity search: "locations within 100 miles of City X" |
| Event | GiST on coordinates | Events by geographic region |
| Scene | GiST on location coordinates | Scenes by geographic area |

---

## 6. Vector Indexes

| Entity | Embedding Field | Index Type | Use Case |
|--------|----------------|------------|----------|
| Character | embedding | IVFFlat | Semantic character search |
| Scene | embedding | IVFFlat | Semantic scene search |
| Event | embedding | IVFFlat | Semantic event search |
| Location | embedding | IVFFlat | Semantic location search |
| Item | embedding | IVFFlat | Semantic item search |

---

## 7. Index Maintenance

| Operation | Frequency | Description |
|-----------|-----------|-------------|
| Rebuild full-text indexes | Daily | Refresh FTS indexes |
| Rebuild vector indexes | Weekly | Refresh embedding indexes |
| Analyze index usage | Weekly | Identify unused indexes |
| Vacuum deleted entities | Daily | Clean up soft-deleted records |
| Update statistics | Weekly | Update query planner stats |

---

## 8. Query Optimization Guidelines

| Pattern | Recommended Index | Example |
|---------|------------------|---------|
| Equality lookup | Hash index | `WHERE entityId = 'character_000001'` |
| Range query | B-tree index | `WHERE date BETWEEN '2020-01-01' AND '2024-12-31'` |
| Full-text search | GIN FTS index | `WHERE name @@ 'gandalf'` |
| Geospatial query | GiST index | `WHERE coordinates <@> point(x,y) < 100` |
| Semantic search | IVFFlat vector index | `WHERE embedding <-> query_embedding < 0.5` |
| Composite filter | Composite index | `WHERE bookId = X AND chapterNumber = Y` |
