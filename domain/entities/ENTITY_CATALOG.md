# Entity Catalog

## Complete Entity Definitions for the Storynaram Domain Model

**Version:** 0.1.0 | **Last Updated:** 2026-07-17

---

## 1. Narrative Entities

### 1.1 Project
| Attribute | Value |
|-----------|-------|
| **Classification** | Aggregate Root |
| **Bounded Context** | Configuration |
| **Purpose** | Root entity for the entire story project. Contains global settings, configuration, and series collection. |
| **Key Attributes** | id, name, description, author, language, genre, targetAudience |
| **Owns** | Series, Config |
| **Lifecycle** | draft → active → archived |
| **Persistence** | config/project.json |

### 1.2 Series
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Narrative |
| **Purpose** | A collection of books that form a series. Provides series-level metadata and ordering. |
| **Key Attributes** | id, name, description, seriesNumber, totalBooks |
| **Parent** | Project |
| **Owns** | Book |
| **Lifecycle** | planning → active → completed → archived |

### 1.3 Book
| Attribute | Value |
|-----------|-------|
| **Classification** | Aggregate Root |
| **Bounded Context** | Narrative |
| **Purpose** | Top-level narrative container. A single published work within a series. |
| **Key Attributes** | id, title, subtitle, series, seriesNumber, wordCount, chapterCount, genre, themes, status |
| **Owns** | Part, Chapter, Arc |
| **Lifecycle** | outline → draft → revision → beta → editing → ready → published → archived |
| **Relationships** | Characters (appear in), Timeline (events in), Locations (settings) |

### 1.4 Part
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Narrative |
| **Purpose** | A major division of a book (e.g., Part One, Part Two). Groups multiple chapters. |
| **Key Attributes** | id, name, number, chapters |
| **Parent** | Book |
| **Lifecycle** | planned → outlined → written → revised → complete |

### 1.5 Arc
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Narrative |
| **Purpose** | A narrative arc that spans multiple chapters or books. Tracks long-form story progression. |
| **Key Attributes** | id, name, type, chapters, characters, description |
| **Parent** | Book |
| **Lifecycle** | planned → active → resolved → archived |

### 1.6 Chapter
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Narrative |
| **Purpose** | A chapter within a book. Contains scenes and advances the narrative. |
| **Key Attributes** | id, title, number, wordCount, pov, summary, status |
| **Parent** | Book |
| **Composes** | Scene |
| **Lifecycle** | outlined → drafted → revised → reviewed → complete |

### 1.7 Scene
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Narrative |
| **Purpose** | The atomic narrative unit. A single continuous event in the story. |
| **Key Attributes** | id, title, number, wordCount, pov, characters, location, time, goal, conflict, tone |
| **Parent** | Chapter |
| **Composes** | Dialogue |
| **Lifecycle** | outlined → drafted → revised → reviewed → complete |
| **Relationships** | Characters (present), Location (setting), Timeline (events in scene) |

### 1.8 Dialogue
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Narrative |
| **Purpose** | A line or sequence of lines spoken by characters. The atomic speech unit. |
| **Key Attributes** | id, speaker, lines, tone, language, subtext |
| **Parent** | Scene |
| **Lifecycle** | drafted → revised → final |

---

## 2. Character Entities

### 2.1 Character
| Attribute | Value |
|-----------|-------|
| **Classification** | Aggregate Root |
| **Bounded Context** | Character |
| **Purpose** | Base entity for all character types. Defines common attributes and behaviors. |
| **Key Attributes** | id, name, description, firstName, lastName, age, gender, race, species, occupation, origin |
| **Owns** | Relationship, Family, Inventory, Memory |
| **Lifecycle** | draft → review → approved → locked → archived |
| **Relationships** | Scenes (appears in), Locations (located at), Organizations (member of), Items (owns), Events (participates in) |
| **Inherits To** | Hero, Heroine, Villain, AntiHero, Supporting, Civilian, Ruler, NPC, Creature, Monster, Spirit, God |

### 2.2 Hero
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Character) |
| **Bounded Context** | Character |
| **Purpose** | Protagonist character — the central figure of the story. |
| **Special Attributes** | heroicTrait, callToAction, characterArc |
| **Inherits From** | Character |

### 2.3 Villain
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Character) |
| **Bounded Context** | Character |
| **Purpose** | Antagonist character — opposes the protagonist. |
| **Special Attributes** | motivation, weakness, backstory |
| **Inherits From** | Character |

### 2.4 Heroine
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Character) |
| **Bounded Context** | Character |
| **Purpose** | Female protagonist character. |
| **Inherits From** | Character |

### 2.5 AntiHero
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Character) |
| **Bounded Context** | Character |
| **Purpose** | Morally ambiguous protagonist. |
| **Inherits From** | Character |

### 2.6 Supporting
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Character) |
| **Bounded Context** | Character |
| **Purpose** | Supporting character that aids the protagonist. |
| **Inherits From** | Character |

### 2.7 Civilian
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Character) |
| **Bounded Context** | Character |
| **Purpose** | Non-combatant background character. |
| **Inherits From** | Character |

### 2.8 Ruler
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Character) |
| **Bounded Context** | Character |
| **Purpose** | Monarch, leader, or governing figure. |
| **Special Attributes** | title, domain, reign |
| **Inherits From** | Character |

### 2.9 NPC
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Character) |
| **Bounded Context** | Character |
| **Purpose** | Non-player character — minor role with limited development. |
| **Inherits From** | Character |

### 2.10 Creature
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Character) |
| **Bounded Context** | Character |
| **Purpose** | Non-humanoid sentient being. |
| **Special Attributes** | species, habitat, intelligence |
| **Inherits From** | Character |

### 2.11 Monster
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Character) |
| **Bounded Context** | Character |
| **Purpose** | Hostile entity — beast or monster. |
| **Special Attributes** | threatLevel, abilities |
| **Inherits From** | Character |

### 2.12 Spirit
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Character) |
| **Bounded Context** | Character |
| **Purpose** | Ethereal or ghostly entity. |
| **Special Attributes** | manifestationType, domain |
| **Inherits From** | Character |

### 2.13 God
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Character) |
| **Bounded Context** | Character |
| **Purpose** | Divine entity — deity or god-like being. |
| **Special Attributes** | domain, power, worshippers |
| **Inherits From** | Character |

---

## 3. World Entities

### 3.1 World
| Attribute | Value |
|-----------|-------|
| **Classification** | Aggregate Root |
| **Bounded Context** | World |
| **Purpose** | Root entity for the story world. Contains all geographical and physical data. |
| **Key Attributes** | id, name, description, type, physics |
| **Owns** | Continent, Location, Climate |

### 3.2 Continent
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | Major landmass division. |
| **Key Attributes** | id, name, description, climate, countries |
| **Composes** | Country |

### 3.3 Country
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | Sovereign nation. |
| **Key Attributes** | id, name, description, population, capital, government, ruler |
| **Parent** | Continent |
| **Owns** | Province, Kingdom |

### 3.4 Kingdom
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | Monarchical state. |
| **Key Attributes** | id, name, ruler, capital, provinces |
| **Parent** | Country (or Empire) |

### 3.5 Empire
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | Imperial domain containing multiple kingdoms. |
| **Key Attributes** | id, name, emperor, kingdoms |
| **Parent** | Continent |
| **Composes** | Kingdom |

### 3.6 Province
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | Administrative region within a country. |
| **Key Attributes** | id, name, population, capital, districts |
| **Parent** | Country |
| **Composes** | District |

### 3.7 District
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | Local administrative division. |
| **Key Attributes** | id, name, cities, villages |
| **Parent** | Province |
| **Composes** | City, Village |

### 3.8 City
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | Urban settlement. |
| **Key Attributes** | id, name, population, government, landmarks, districts, economy |
| **Parent** | District or Province |

### 3.9 Village
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | Rural settlement. |
| **Key Attributes** | id, name, population, economy |
| **Parent** | District |

### 3.10 Location
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | Specific named place where scenes and events occur. |
| **Key Attributes** | id, name, description, type, coordinates, parent |
| **Lifecycle** | draft → active → destroyed → archived |

### 3.11 Geographic Features
Forest, Mountain, River, Ocean, Island, Cave, Dungeon, Castle, Temple, Landmark
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | Natural or constructed geographical features. |
| **Key Attributes** | id, name, description, type, coordinates, region |
| **Parent** | Continent |

---

## 4. Organization Entities

### 4.1 Organization
| Attribute | Value |
|-----------|-------|
| **Classification** | Aggregate Root |
| **Bounded Context** | Organization |
| **Purpose** | Base entity for all organized groups. |
| **Key Attributes** | id, name, description, type, leader, headquarters, members, founded |
| **Inherits To** | Guild, Army, Religion, Government, SecretSociety, Company, Clan, Tribe |

### 4.2 Guild
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Organization) |
| **Bounded Context** | Organization |
| **Purpose** | Trade or professional association. |
| **Special Attributes** | trade, rank, members |
| **Inherits From** | Organization |

### 4.3 Army
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Organization) |
| **Bounded Context** | Organization |
| **Purpose** | Military organization. |
| **Special Attributes** | size, branches, chainOfCommand |
| **Inherits From** | Organization |

### 4.4 Family (Organization)
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Organization |
| **Purpose** | Family or house as an organized group. |
| **Key Attributes** | id, name, head, members, lineage, sigil |
| **Lifecycle** | active → extinct → restored |

### 4.5 Clan / Tribe
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Organization) |
| **Bounded Context** | Organization |
| **Purpose** | Kinship-based social group. |
| **Inherits From** | Organization |

---

## 5. Timeline Entities

### 5.1 Timeline
| Attribute | Value |
|-----------|-------|
| **Classification** | Aggregate Root |
| **Bounded Context** | Timeline |
| **Purpose** | Root entity for all chronological data. |
| **Key Attributes** | id, name, description, calendars |
| **Owns** | Era, Calendar, Event |

### 5.2 Era
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Timeline |
| **Purpose** | Major time period or age. |
| **Key Attributes** | id, name, startYear, endYear, description, events |

### 5.3 Calendar
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Timeline |
| **Purpose** | Calendar system definition. |
| **Key Attributes** | id, name, months, weeks, days, epochs |

### 5.4 Event
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Timeline |
| **Purpose** | A specific occurrence at a point in time. |
| **Key Attributes** | id, name, date, description, significance, participants, location |
| **Lifecycle** | draft → confirmed → canon → archived |
| **Relationships** | Characters (participants), Location (where), War (part of) |

### 5.5 War
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Timeline |
| **Purpose** | Armed conflict between groups. |
| **Key Attributes** | id, name, startDate, endDate, combatants, outcome, battles |

### 5.6 Prophecy
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Timeline |
| **Purpose** | A predicted future event. |
| **Key Attributes** | id, text, prophesiedDate, fulfillmentDate, fulfilled |
| **Lifecycle** | prophesied → fulfilled → broken → archived |

### 5.7 Quest
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Narrative |
| **Purpose** | A mission or journey undertaken by characters. |
| **Key Attributes** | id, name, description, giver, receiver, objectives, reward, status |

---

## 6. Magic Entities

### 6.1 Magic
| Attribute | Value |
|-----------|-------|
| **Classification** | Aggregate Root |
| **Bounded Context** | Magic |
| **Purpose** | Root entity for magical systems and phenomena. |
| **Key Attributes** | id, name, type, description, rules, limitations |
| **Inherits To** | MagicSystem |
| **Owns** | Spell, Skill, Ability, Curse, Blessing, Element, School |

### 6.2 Spell
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Magic |
| **Purpose** | A specific magical incantation or effect. |
| **Key Attributes** | id, name, description, school, element, incantation, components, effect, range, duration, cost, difficulty |
| **Parent** | Magic system or School |
| **Relationships** | Characters (casters), Items (contained in) |

### 6.3 Skill
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Magic |
| **Purpose** | A learned magical ability or technique. |
| **Key Attributes** | id, name, description, type, proficiency |

### 6.4 Ability
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Magic |
| **Purpose** | An innate or granted magical capability. |
| **Key Attributes** | id, name, description, source, powerLevel |

### 6.5 Curse
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Magic |
| **Purpose** | A detrimental magical effect. |
| **Key Attributes** | id, name, effect, origin, removal |

### 6.6 Blessing
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Magic |
| **Purpose** | A beneficial magical effect. |
| **Key Attributes** | id, name, effect, source, duration |

---

## 7. Item Entities

### 7.1 Item
| Attribute | Value |
|-----------|-------|
| **Classification** | Aggregate Root |
| **Bounded Context** | Item |
| **Purpose** | Base entity for all physical objects. |
| **Key Attributes** | id, name, description, type, material, weight, value, condition, rarity, magical |
| **Inherits To** | Weapon, Armor, Potion, Treasure, Relic, Book, Document, Currency, Food, Medicine, Artifact |
| **Relationships** | Characters (owner/keeper), Locations (stored at) |

### 7.2 Weapon
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Item) |
| **Bounded Context** | Item |
| **Purpose** | Weapon item — used for combat. |
| **Special Attributes** | weaponType, damage, range, material |
| **Inherits From** | Item |

### 7.3 Armor
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Item) |
| **Bounded Context** | Item |
| **Purpose** | Protective gear. |
| **Special Attributes** | armorType, defense, coverage |
| **Inherits From** | Item |

### 7.4 Potion
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Item) |
| **Bounded Context** | Item |
| **Purpose** | Consumable magical or medicinal liquid. |
| **Special Attributes** | effect, duration, quantity |
| **Inherits From** | Item |

### 7.5 Treasure
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Item) |
| **Bounded Context** | Item |
| **Purpose** | Valuable item — coins, gems, precious objects. |
| **Special Attributes** | value, material, origin |
| **Inherits From** | Item |

### 7.6 Relic
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Item) |
| **Bounded Context** | Item |
| **Purpose** | Historical or magical relic of significance. |
| **Special Attributes** | era, significance, powers |
| **Inherits From** | Item |

### 7.7 Artifact
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Item) |
| **Bounded Context** | Item |
| **Purpose** | Powerful magical object. |
| **Special Attributes** | powers, origin, destruction, currentKeeper |
| **Inherits From** | Item |

Note: Technology is a separate aggregate from Item. While Item covers physical objects, Technology covers systems, inventions, and knowledge. They may overlap (a magical sword is both an Item and Technology). In such cases, reference both entities.

---

## 8. Technology Entities

### 8.1 Technology
| Attribute | Value |
|-----------|-------|
| **Classification** | Aggregate Root |
| **Bounded Context** | Item |
| **Purpose** | Base entity for all technological systems and inventions. |
| **Key Attributes** | id, name, description, type, tier, inventor, materials, energySource |
| **Inherits To** | Vehicle, Machine, Communication, Medicine, Invention |

### 8.2 Vehicle
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Technology) |
| **Bounded Context** | Item |
| **Purpose** | Transportation technology. |
| **Special Attributes** | vehicleType, speed, capacity, propulsion |

### 8.3 Machine
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity (specialization of Technology) |
| **Bounded Context** | Item |
| **Purpose** | Mechanical device. |
| **Special Attributes** | purpose, mechanism, power |

---

## 9. Lore & Culture Entities

### 9.1 Lore
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | Cultural knowledge, mythology, and traditions. |
| **Key Attributes** | id, name, type, content, culture, origin |
| **Inherits To** | Myth, Legend, Folklore, Tradition, Ritual, Symbol, Festival |

### 9.2 Religion
| Attribute | Value |
|-----------|-------|
| **Classification** | Aggregate Root |
| **Bounded Context** | World |
| **Purpose** | A system of faith and worship. |
| **Key Attributes** | id, name, description, pantheon, doctrines, rituals, clergy |

### 9.3 Culture
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | A distinct cultural group with shared customs and identity. |
| **Key Attributes** | id, name, description, values, customs, language, religion, region |

### 9.4 Language
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | A constructed or natural language. |
| **Key Attributes** | id, name, family, script, phonology, grammar |

### 9.5 Race
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | A cultural-ethnic grouping within a species. |
| **Key Attributes** | id, name, description, traits, homeland |

### 9.6 Species
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | A biological species classification. |
| **Key Attributes** | id, name, classification, characteristics, habitat |

---

## 10. System Entities

### 10.1 Tag
| Attribute | Value |
|-----------|-------|
| **Classification** | Value Object |
| **Bounded Context** | Configuration |
| **Purpose** | Classification label for entities. |
| **Key Attributes** | name, category |

### 10.2 Note
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Configuration |
| **Purpose** | Author note or annotation. |
| **Key Attributes** | id, title, content, entity references, tags |

### 10.3 Memory (AI)
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | AI |
| **Purpose** | AI or character memory record. Memory is separated by type: AI operational memory, character in-story knowledge, story narrative context, system state, and canon records. |
| **Key Attributes** | id, memoryType (ai/character/story/system/canon), content, timestamp, entityReferences, importance, ttl |
| **Ownership** | AI (ai_memory), Character (character_memory), Story (story_memory), System (system_memory), Canon (canon_memory) |
| **Lifecycle** | active → archived → purged |

Note: Character-owned memories are owned by the Character aggregate and linked via the Memory entity. AI-owned memories are managed by the AI Memory System in ai/memory/.

### 10.4 Rule
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Configuration |
| **Purpose** | A project rule governing story creation. |
| **Key Attributes** | id, name, description, category, enforcement |

### 10.5 Canon
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Configuration |
| **Purpose** | A canon record marking an entity as definitive truth. |
| **Key Attributes** | id, entityId, entityType, status, lockedAt, version |

### 10.6 Glossary
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Configuration |
| **Purpose** | A glossary term definition. |
| **Key Attributes** | id, term, definition, category, relatedTerms |

### 10.7 Reference
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Configuration |
| **Purpose** | An external reference source. |
| **Key Attributes** | id, title, type, source, url, notes |

### 10.8 Map
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | World |
| **Purpose** | A visual map of a world region. |
| **Key Attributes** | id, name, type, region, fileReference |

### 10.9 Image
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Configuration |
| **Purpose** | A visual asset reference. |
| **Key Attributes** | id, name, type, fileReference, description |

### 10.10 Document
| Attribute | Value |
|-----------|-------|
| **Classification** | Entity |
| **Bounded Context** | Narrative |
| **Purpose** | An in-story document (letter, scroll, proclamation). |
| **Key Attributes** | id, title, content, author, date, language |

---

## Entity Count Summary

| Category | Entity Count |
|----------|-------------|
| Narrative | 8 |
| Character | 13 |
| World | 17 |
| Organization | 8 |
| Timeline | 7 |
| Magic | 6 |
| Item | 7 |
| Technology | 3 |
| Lore & Culture | 7 |
| System | 10 |
| **Total** | **86** |
