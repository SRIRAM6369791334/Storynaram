# Domain Aggregates

## Aggregate Root Definitions and Boundaries

---

## 1. Book Aggregate

| Property | Value |
|----------|-------|
| Aggregate Root | `Book` |
| Transactional Boundary | Book, Parts, Chapters, Scenes, Arcs |
| Identity | `book_{seq}` |
| Status | Outline, Draft, Revision, Beta, Editing, Ready, Published, Archived |

### Entities
- Book (root) — title, subtitle, description, ISBN, volume number, part count, chapter count, word count, status, metadata
- Part — part number, title, summary (optional)
- Chapter — chapter number, title, summary, word count, status, POV
- Scene — scene number, title, summary, acting characters, location, time, dialogue count
- Dialogue — speaker, line number, dialogue text, direction
- Arc — arc name, arc type, description, chapters involved

### Invariants
- Chapter numbers are sequential within a book
- Scene numbers are sequential within a chapter
- Part numbers are sequential within a book
- A scene must have at least one character present
- Dialogue must reference an existing character

---

## 2. Character Aggregate

| Property | Value |
|----------|-------|
| Aggregate Root | `Character` |
| Transactional Boundary | Character, Relationship, Inventory, Family, Memory |
| Identity | `character_{seq}` |
| Status | Concept, Draft, Developed, Final, Locked, Archived |

### Entities
- Character (root) — name, age, gender, race, species, class, rank, description, backstory, arc, metadata
- Relationship — target character ID, relationship type, strength, description, timeline
- Inventory — item ID, slot, quantity, condition
- Family — relative character ID, relation type, notes
- Memory — memory ID, event reference, description, emotion

### Invariants
- Character must belong to exactly one race and one species
- Relationships are bidirectional (creating one creates the inverse)
- A character cannot have a relationship with itself
- Each inventory slot can hold only one item type
- Family relationships must be consistent (cyclic detection)

---

## 3. World Aggregate

| Property | Value |
|----------|-------|
| Aggregate Root | `World` |
| Transactional Boundary | World, Continents, Countries, Provinces, Districts, Cities, Villages, Locations |
| Identity | `world_{seq}` |
| Status | Draft, Development, Final, Frozen, Archived |

### Entities
- World (root) — name, type, description, cosmology, size, age
- Continent — name, description, geography type, climate zones
- Country — name, description, government, population, capital
- Province — name, description, ruler, resources
- District — name, description, type, population
- City — name, description, population, landmarks, defenses
- Village — name, description, population, industry
- Location — name, type, coordinates, description, features

### Invariants
- A Province belongs to exactly one Country
- A District belongs to exactly one Province
- A City/Village belongs to exactly one District
- A Location must exist in exactly one parent (City/Village/District)
- Geographic hierarchy must be acyclic

---

## 4. Timeline Aggregate

| Property | Value |
|----------|-------|
| Aggregate Root | `Timeline` |
| Transactional Boundary | Timeline, Eras, Events, Calendars |
| Identity | `timeline_{seq}` |
| Status | Draft, Active, Frozen, Archived |

### Entities
- Timeline (root) — name, description, start date, end date
- Era — name, description, start year, end year, significance
- Calendar — name, type, months, days, leap rules
- Event — name, type, date, location, participants, outcome, significance

### Invariants
- Events within an Era must fall within the Era's date range
- Eras within a Timeline must not overlap
- A Calendar belongs to exactly one Timeline

---

## 5. Organization Aggregate

| Property | Value |
|----------|-------|
| Aggregate Root | `Organization` |
| Transactional Boundary | Organization, Branches, Members |
| Identity | `organization_{seq}` |
| Status | Concept, Active, Inactive, Defunct, Archived |

### Entities
- Organization (root) — name, type, description, headquarters, founding date, dissolution date
- Branch — name, location, leader, type
- Member — character ID, role, rank, join date, leave date

### Invariants
- An Organization must have at least one member to be Active
- A Character can belong to the same Organization only once
- Branch locations must be within the same world as the parent organization

---

## 6. Magic Aggregate

| Property | Value |
|----------|-------|
| Aggregate Root | `Magic` |
| Transactional Boundary | Magic, Spells, Skills, Abilities |
| Identity | `magic_{seq}` |
| Status | Draft, Active, Restricted, Lost, Archived |

### Entities
- Magic (root) — system name, type, source, cost, limitations
- Spell — name, type, school, power level, mana cost, effect, duration
- Skill — name, type, level, experience, requirements
- Ability — name, type, innate/learned, cooldown, prerequisites

### Invariants
- A Spell's power level must be within the Magic system's range
- Magic costs must be payable by the caster's resource pool
- Skills must have prerequisites satisfied before they can be assigned

---

## 7. Item Aggregate

| Property | Value |
|----------|-------|
| Aggregate Root | `Item` |
| Transactional Boundary | Item, Variations |
| Identity | `item_{seq}` |
| Status | Draft, Available, Owned, Consumed, Destroyed, Archived |

### Entities
- Item (root) — name, type, description, weight, value, rarity, condition
- Variation — name, material, quality, modifier, enchantment

### Invariants
- An item's rarity determines its maximum power level
- An Item can be in only one owner's inventory at a time
- Consumed items cannot be reused
