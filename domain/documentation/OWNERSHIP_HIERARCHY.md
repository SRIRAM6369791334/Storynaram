# Ownership Hierarchy

## Containment, Belonging, and Responsibility

---

## 1. Ownership Model

### Ownership Types

| Type | Description | Example |
|------|-------------|---------|
| Containment | Parent entity contains child entities | Book contains Chapters |
| Belonging | Entity belongs to another | Character belongs to a Species |
| Management | Entity manages/responsible for another | Author manages Project |
| Reference | Entity references another without ownership | Scene references Location |

### Ownership Rules

1. An entity can be contained by exactly one parent aggregate (single ownership)
2. An entity can reference many other entities without owning them
3. Deletion of a parent cascades to its contained children
4. Referenced entities must not be deleted while references exist

---

## 2. Full Ownership Hierarchy

```
Project
├── Series                  [containment]
│   └── Book                [containment]
│       ├── Part            [containment]
│       ├── Chapter         [containment]
│       │   └── Scene       [containment]
│       │       └── Dialogue [containment]
│       └── Arc             [containment]

World
├── Continent               [containment]
│   └── Country             [containment]
│       ├── Province        [containment]
│       │   └── District    [containment]
│       │       ├── City    [containment]
│       │       └── Village [containment]
│       └── Kingdom         [containment]
│           └── Empire      [belonging]

Timeline
├── Era                     [containment]
│   └── Event               [containment]
├── Calendar                [containment]
└── War                     [containment]
    └── Battle              [containment]

Character
├── Relationship            [containment]
├── Inventory               [containment]
├── Family                  [containment]
├── Memory                  [containment]
└── Species                 [belonging]
└── Race                    [belonging]

Organization
├── Branch                  [containment]
└── Member                  [containment]

Magic
├── Spell                   [containment]
├── Skill                   [containment]
├── Ability                 [containment]

Item
├── Variation               [containment]
└── Character/Inventory     [belonging]
```

---

## 3. Ownership Matrix

| Entity | Owned By | Owner Type | Cascade Delete | Nullable Owner |
|--------|----------|------------|----------------|----------------|
| Series | Project | Containment | Yes | Yes |
| Book | Series | Containment | Yes | Yes |
| Part | Book | Containment | Yes | Yes |
| Chapter | Book | Containment | Yes | No |
| Scene | Chapter | Containment | Yes | No |
| Dialogue | Scene | Containment | Yes | No |
| Arc | Book | Containment | Yes | Yes |
| Character | Project | Containment | Yes | No |
| Relationship | Character | Containment | Yes | No |
| Inventory | Character | Containment | Yes | No |
| Family | Character | Containment | Yes | No |
| Memory | Character | Containment | Yes | No |
| Species | Project | Management | No | No |
| Race | Project | Management | No | No |
| World | Project | Containment | Yes | Yes |
| Continent | World | Containment | Yes | No |
| Country | Continent | Containment | Yes | No |
| Province | Country | Containment | Yes | No |
| District | Province | Containment | Yes | No |
| City | District | Containment | Yes | No |
| Village | District | Containment | Yes | No |
| Kingdom | Country | Containment | Yes | Yes |
| Empire | Kingdom | Belonging | No | Yes |
| Location | City/Village/District | Containment | Yes | Yes |
| Timeline | Project | Containment | Yes | Yes |
| Era | Timeline | Containment | Yes | No |
| Calendar | Timeline | Containment | Yes | Yes |
| Event | Era | Containment | Yes | No |
| War | Era | Containment | Yes | Yes |
| Battle | War | Containment | Yes | No |
| Organization | Project | Containment | Yes | Yes |
| Branch | Organization | Containment | Yes | Yes |
| Member | Organization | Containment | Yes | No |
| Magic | Project | Containment | Yes | Yes |
| Spell | Magic | Containment | Yes | No |
| Skill | Magic | Containment | Yes | No |
| Ability | Magic | Containment | Yes | No |
| Item | Project | Containment | Yes | Yes |
| Variation | Item | Containment | Yes | No |

---

## 4. Reference Ownership (Non-cascading)

| Entity | References | Reference Type |
|--------|-----------|----------------|
| Scene | Location | Location reference |
| Scene | Character | Character reference |
| Event | Location | Location reference |
| Event | Character | Character reference |
| Relationship | Character | Target character reference |
| Family | Character | Relative character reference |
| Inventory | Item | Item reference |
| Member | Character | Character reference |
| Spell | Character | Caster reference |
| Dialogue | Character | Speaker reference |
| Book | Timeline | Timeline reference |
| Book | World | World reference |
| Scene | Timeline | In-world date/time |

---

## 5. Ownership by Role

| Role | Owns | Manages |
|------|------|---------|
| Project Owner | Project | All entities within project |
| Author | Book, Chapter, Scene | Characters, World settings |
| World Builder | World, Geography | Locations, Ecology |
| Character Writer | Character | Relationships, Backstory |
| Editor | Book | Review, Status transitions |
| System | All metadata | Audit, Indexing |
| AI Pipeline | Knowledge Graph | Retrieval, Context |
