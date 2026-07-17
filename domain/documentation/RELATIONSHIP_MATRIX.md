# Relationship Matrix

## Cross-Entity Relationship Catalog

---

## 1. Relationship Grid

| Entity A | Entity B | Relationship Type | Cardinality | Bidirectional |
|----------|----------|-------------------|-------------|---------------|
| Book | Series | belongs_to | Many-to-One | Yes |
| Book | Chapter | contains | One-to-Many | Yes |
| Book | Arc | contains | One-to-Many | Yes |
| Book | Part | contains | One-to-Many | Yes |
| Chapter | Scene | contains | One-to-Many | Yes |
| Chapter | Character | has_pov | Many-to-One | Yes |
| Scene | Character | features | Many-to-Many | Yes |
| Scene | Location | occurs_at | Many-to-One | Yes |
| Scene | Dialogue | contains | One-to-Many | Yes |
| Dialogue | Character | spoken_by | Many-to-One | Yes |
| Character | Species | belongs_to | Many-to-One | Yes |
| Character | Race | belongs_to | Many-to-One | Yes |
| Character | Relationship | has | One-to-Many | Yes |
| Character | Inventory | owns | One-to-Many | Yes |
| Character | Family | member_of | One-to-Many | Yes |
| Character | Memory | possesses | One-to-Many | Yes |
| Character | Organization | member_of | Many-to-Many | Yes |
| Character | Event | participates_in | Many-to-Many | Yes |
| Character | Magic | uses | Many-to-Many | Yes |
| Character | Book | appears_in | Many-to-Many | Yes |
| Document | Character | authored_by | Many-to-One | Yes |
| World | Continent | contains | One-to-Many | Yes |
| Continent | Country | contains | One-to-Many | Yes |
| Country | Province | contains | One-to-Many | Yes |
| Country | Kingdom | contains | One-to-Many | Yes |
| Province | District | contains | One-to-Many | Yes |
| District | City | contains | One-to-Many | Yes |
| District | Village | contains | One-to-Many | Yes |
| Kingdom | Empire | belongs_to | Many-to-One | Yes |
| Language | Culture | spoken_by | Many-to-One | Yes |
| Timeline | Era | contains | One-to-Many | Yes |
| Timeline | Calendar | contains | One-to-Many | Yes |
| Era | Event | contains | One-to-Many | Yes |
| Event | War | categorizes | One-to-Many | Yes |
| War | Battle | contains | One-to-Many | Yes |
| Event | Character | involves | Many-to-Many | Yes |
| Event | Location | occurs_at | Many-to-One | Yes |
| Family | Character | includes | One-to-Many | Yes |
| Image | Entity | depicts | Many-to-One | Yes |
| Organization | Branch | has | One-to-Many | Yes |
| Organization | Character | employs | Many-to-Many | Yes |
| Magic | Spell | contains | One-to-Many | Yes |
| Magic | Skill | contains | One-to-Many | Yes |
| Magic | Ability | contains | One-to-Many | Yes |
| Spell | Character | castable_by | Many-to-Many | Yes |
| Item | Character | owned_by | Many-to-One | Yes |
| Item | Location | stored_at | Many-to-One | Yes |
| Item | Variation | has | One-to-Many | Yes |
| Technology | Character | uses | Many-to-Many | Yes |
| Technology | World | tech_level | Many-to-One | Yes |
| Technology | Location | available_at | Many-to-Many | Yes |
| Technology | Event | invented_at | Many-to-One | Yes |
| Lore | Culture | defines | One-to-Many | Yes |
| Lore | Religion | defines | One-to-Many | Yes |
| Culture | Character | shapes | Many-to-Many | Yes |
| Culture | Religion | has_religion | Many-to-One | Yes |
| Religion | Character | influences | Many-to-Many | Yes |
| Lore | Event | explains | One-to-Many | Yes |
| Map | Location | depicts | One-to-Many | Yes |
| Note | Entity | references | Many-to-Many | Yes |
| Race | Species | belongs_to | Many-to-One | Yes |
| Rule | Entity | governs | Many-to-Many | Yes |

---

## 2. Relationship Cardinality Summary

| Cardinality | Count | Examples |
|-------------|-------|----------|
| One-to-One | 0 | (none in current model) |
| One-to-Many | 38 | Book→Chapter, World→Continent, Character→Relationship |
| Many-to-One | 12 | Chapter→Book, Scene→Location, Dialogue→Character |
| Many-to-Many | 9 | Scene↔Character, Event↔Character, Character↔Organization |

---

## 3. Relationship Attributes

Each relationship can be annotated with:

| Attribute | Type | Description |
|-----------|------|-------------|
| role | string | Role of each entity in the relationship |
| strength | float | Relationship strength (0.0 - 1.0) |
| direction | enum | Unidirectional, Bidirectional |
| status | enum | Active, Inactive, Broken, Pending |
| timeline | ref | When relationship is valid |
| description | string | Narrative description |

### Example: Character → Character Relationship

| Relationship | Role A | Role B | Strength | Direction |
|-------------|--------|--------|----------|-----------|
| Friendship | Friend | Friend | 0.0-1.0 | Bidirectional |
| Romance | Lover | Lover | 0.0-1.0 | Bidirectional |
| Family | Parent | Child | 1.0 | Bidirectional |
| Rivalry | Rival | Rival | 0.0-1.0 | Bidirectional |
| Mastery | Master | Apprentice | 0.0-1.0 | Unidirectional |
| Allegiance | Lord | Vassal | 0.0-1.0 | Unidirectional |
| Hatred | Hater | Target | 0.0-1.0 | Unidirectional |

---

## 4. Relationship Validation Rules

| Rule | Description |
|------|-------------|
| Symmetry | Friendship, Romance, Rivalry are symmetric; Mastery, Hatred, Allegiance are not |
| Consistency | A Character cannot be both Friend and Enemy to the same target |
| Acyclicity | Family relationships must not create cycles |
| Existence | Both endpoints must exist before relationship creation |
| Uniqueness | A Character can have only one active Romance relationship |
| Timelines | Relationships can be limited to specific time intervals |
