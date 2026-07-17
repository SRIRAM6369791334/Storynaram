# Database Readiness Assessment

## Persistence Layer Evaluation and Mapping

---

## 1. Supported Database Types

| Database Type | Suitability | Primary Use Case |
|--------------|-------------|------------------|
| PostgreSQL | Excellent | Primary database — relational data, JSONB, full-text search |
| MongoDB | Good | Document storage for scenes, characters with variable schemas |
| SQLite | Good | Local development, mobile, single-user scenarios |
| Neo4j | Excellent | Relationship-heavy queries, character graphs |
| Elasticsearch | Excellent | Full-text search, aggregation queries |
| Redis | Good | Caching, session data, temporary storage |

---

## 2. Entity-to-Table Mapping (Relational)

| Entity | Table Name | Primary Key | Schema |
|--------|-----------|-------------|--------|
| Project | projects | project_id | id, name, description, status, metadata |
| Series | series | series_id | id, project_id, name, description, order |
| Book | books | book_id | id, series_id, title, subtitle, volume, status, word_count, metadata |
| Part | parts | part_id | id, book_id, number, title, summary |
| Chapter | chapters | chapter_id | id, book_id, part_id, number, title, summary, word_count, pov, status |
| Scene | scenes | scene_id | id, chapter_id, number, title, summary, content, location_id, metadata |
| Dialogue | dialogues | dialogue_id | id, scene_id, line_number, speaker_id, text, direction |
| Arc | arcs | arc_id | id, book_id, name, type, description |
| Character | characters | character_id | id, name, species_id, race_id, archetype, age, gender, status, metadata |
| CharacterBook | character_books | composite | character_id, book_id, role |
| Relationship | relationships | relationship_id | id, source_character_id, target_character_id, type, strength, description |
| Inventory | inventory | inventory_id | id, character_id, item_id, slot, quantity, condition |
| Family | family | family_id | id, character_id, relative_id, relation_type, notes |
| Memory | memories | memory_id | id, character_id, event_id, description, emotion |
| Species | species | species_id | id, name, description, category |
| Race | races | race_id | id, name, description, species_id |
| World | worlds | world_id | id, project_id, name, type, description, cosmology |
| Continent | continents | continent_id | id, world_id, name, description, area, climate_zones |
| Country | countries | country_id | id, continent_id, name, government, capital, population |
| Province | provinces | province_id | id, country_id, name, ruler, resources |
| District | districts | district_id | id, province_id, name, type, population |
| City | cities | city_id | id, district_id, name, population, defenses |
| Village | villages | village_id | id, district_id, name, population, industry |
| Location | locations | location_id | id, parent_type, parent_id, name, type, coordinates, description |
| Kingdom | kingdoms | kingdom_id | id, country_id, name, ruler, empire_id |
| Empire | empires | empire_id | id, name, ruler |
| Timeline | timelines | timeline_id | id, project_id, name, description |
| Era | eras | era_id | id, timeline_id, name, description, start_year, end_year |
| Calendar | calendars | calendar_id | id, timeline_id, name, months, days, leap_rules |
| Event | events | event_id | id, era_id, name, type, date, location_id, outcome, significance |
| EventCharacter | event_characters | composite | event_id, character_id |
| War | wars | war_id | id, era_id, name, outcome |
| Battle | battles | battle_id | id, war_id, name, date, location_id, outcome |
| Prophecy | prophecies | prophecy_id | id, timeline_id, text, fulfilled, fulfillment_event_id |
| Organization | organizations | organization_id | id, project_id, name, type, description, headquarters_id |
| Branch | branches | branch_id | id, organization_id, name, location_id, leader_id |
| Member | members | member_id | id, organization_id, character_id, role, rank, join_date, leave_date |
| Magic | magic_systems | magic_id | id, project_id, name, type, source, cost, limitations |
| Spell | spells | spell_id | id, magic_id, name, school, power_level, mana_cost, effect, duration |
| CharacterSpell | character_spells | composite | character_id, spell_id |
| Skill | skills | skill_id | id, magic_id, name, type, level, requirements |
| CharacterSkill | character_skills | composite | character_id, skill_id |
| Ability | abilities | ability_id | id, magic_id, name, type, cooldown, prerequisites |
| CharacterAbility | character_abilities | composite | character_id, ability_id |
| Item | items | item_id | id, project_id, name, type, description, weight, value, rarity |
| Variation | variations | variation_id | id, item_id, name, material, quality |
| Lore | lore | lore_id | id, project_id, title, content, category, significance |
| Culture | cultures | culture_id | id, lore_id, name, description, traditions |
| Religion | religions | religion_id | id, lore_id, name, description, deity, dogma |
| Language | languages | language_id | id, lore_id, name, script, speakers |
| Tag | tags | tag_id | id, project_id, name, category, color |
| EntityTag | entity_tags | composite | entity_id, entity_type, tag_id |

---

## 3. Recommended Storage Strategies

### PostgreSQL (Primary)

```sql
-- JSONB for flexible metadata
ALTER TABLE characters ADD COLUMN metadata JSONB;
ALTER TABLE scenes ADD COLUMN metadata JSONB;

-- Full-text search vectors
ALTER TABLE characters ADD COLUMN search_vector tsvector;
CREATE INDEX characters_fts_idx ON characters USING GIN(search_vector);

-- Geospatial
CREATE EXTENSION postgis;
SELECT AddGeometryColumn('locations', 'geom', 4326, 'POINT', 2);
CREATE INDEX locations_geom_idx ON locations USING GIST(geom);

-- Partial indexes for active data
CREATE INDEX active_characters ON characters WHERE status != 'ARCHIVED';
```

### MongoDB (Document Store)

```json
{
  "collection": "scenes",
  "document": {
    "_id": "scene_000001",
    "chapterId": "chapter_000001",
    "title": "The Meeting",
    "content": "...",
    "characters": ["character_000001", "character_000015"],
    "locationId": "location_000042",
    "metadata": {},
    "tags": []
  }
}
```

### Neo4j (Graph)

```cypher
// Character relationships
CREATE (c1:Character {id: 'character_000001', name: 'Aragorn'})
CREATE (c2:Character {id: 'character_000015', name: 'Legolas'})
CREATE (c1)-[:FRIENDS_WITH {strength: 0.9}]->(c2)

// Character - scene - location graph
MATCH (c:Character {id: 'character_000001'})
MATCH (s:Scene {id: 'scene_000042'})
MATCH (l:Location {id: 'location_000010'})
CREATE (c)-[:APPEARS_IN]->(s)
CREATE (s)-[:OCCURS_AT]->(l)
```

---

## 4. Performance Considerations

| Factor | Recommendation |
|--------|---------------|
| Entity count < 100K | Any database; no special tuning needed |
| Entity count 100K-1M | PostgreSQL with indexes; partition large tables |
| Entity count > 1M | Sharding or read replicas; materialized views for aggregates |
| Full-text search | Elasticsearch for >100K documents; PostgreSQL FTS for smaller |
| Graph queries | Neo4j for complex relationship traversals (depth > 3) |
| Real-time queries | Redis caching for frequently accessed entities |
| Report queries | Materialized views refreshed periodically |
| Geospatial queries | PostgreSQL with PostGIS extension |

---

## 5. Migration Strategy

| Phase | Action | Description |
|-------|--------|-------------|
| 1 | Schema definition | Define all tables, indexes, constraints |
| 2 | Initial migration | Create tables, add base indexes |
| 3 | Seed data | Insert project structure, base entities |
| 4 | Index tuning | Add composite indexes based on query patterns |
| 5 | Full-text migration | Build FTS indexes, configure language support |
| 6 | Graph migration | Export relationships to Neo4j if needed |
| 7 | Cache layer | Add Redis for hot entities |
| 8 | Sharding | Partition large tables if needed |
