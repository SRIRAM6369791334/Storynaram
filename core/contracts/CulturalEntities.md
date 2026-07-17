# Cultural Entities Contracts

## Species, Race, Culture, Religion, Language, Lore

---

## Species Contract

### Purpose
Defines the data contract for species entities — biological classification for characters and creatures.

### Entity Type
`species`

### Ownership
Owned by Project. Referenced by Character.

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Species ID: `species_000001` |
| `type` | string | Yes | Must be `"species"` |
| `name` | string | Yes | Species name (Title Case) |
| `description` | string | Recommended | Species description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Species-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags |

### Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `classification` | string | Recommended | Taxonomic classification |
| `characteristics` | array | Optional | Defining characteristics |
| `lifespan` | integer | Optional | Average lifespan in years |
| `habitat` | string | Optional | Natural habitat |
| `intelligence` | string | Optional | sentient, semi-sentient, non-sentient |
| `races` | array | Optional | Race IDs belonging to this species |

### Species Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | null | Species has no parent |
| `children` | 0-N | Race IDs belonging to this species |
| `related` | 0-N | Related entities (characters, lore) |

### Lifecycle
`draft` → `final` → `archived`

### ID Format
`species_000001`

---

## Race Contract

### Purpose
Defines the data contract for race entities — cultural-ethnic groupings within a species.

### Entity Type
`race`

### Ownership
Owned by Project / Species. Referenced by Character.

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Race ID: `race_000001` |
| `type` | string | Yes | Must be `"race"` |
| `name` | string | Yes | Race name (Title Case) |
| `description` | string | Recommended | Race description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Race-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags |

### Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `speciesId` | string | Yes | Parent species ID |
| `traits` | array | Optional | Common racial traits |
| `homeland` | string | Optional | Origin location ID |
| `population` | integer | Optional | Estimated population |

### Race Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 1 | Species ID |
| `children` | 0-N | Character IDs of this race |
| `related` | 0-N | Related entities (cultures, locations) |

### Lifecycle
`draft` → `final` → `archived`

### ID Format
`race_000001`

---

## Culture Contract

### Purpose
Defines the data contract for culture entities — shared customs, values, and identity.

### Entity Type
`culture`

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Culture ID: `culture_000001` |
| `type` | string | Yes | Must be `"culture"` |
| `name` | string | Yes | Culture name |
| `description` | string | Recommended | Culture description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Culture-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags |

### Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `values` | array | Recommended | Core cultural values |
| `customs` | array | Optional | Characteristic customs |
| `languageId` | string | Optional | Primary language ID |
| `religionId` | string | Optional | Primary religion ID |
| `regionId` | string | Optional | Geographic region |
| `socialStructure` | string | Optional | Social organization |

### Culture Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Parent culture |
| `children` | 0-N | Sub-cultures |
| `related` | 0-N | Related entities (characters, locations, lore) |

### Lifecycle
`draft` → `developed` → `final` → `archived`

### ID Format
`culture_000001`

---

## Religion Contract

### Purpose
Defines the data contract for religion entities — systems of faith and worship.

### Entity Type
`religion`

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Religion ID: `religion_000001` |
| `type` | string | Yes | Must be `"religion"` |
| `name` | string | Yes | Religion name |
| `description` | string | Recommended | Religion description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Religion-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags |

### Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pantheon` | array | Recommended | Deity character IDs |
| `doctrines` | array | Optional | Core beliefs |
| `rituals` | array | Optional | Important rituals |
| `clergy` | array | Optional | Clergy character IDs |
| `holyText` | string | Optional | Sacred text reference |
| `origin` | string | Optional | Origin story |
| `followers` | integer | Optional | Estimated follower count |

### Religion Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | null | Religion has no parent |
| `children` | 0-N | Religious orders or sects |
| `related` | 0-N | Related entities (characters, locations, events) |

### Lifecycle
`draft` → `active` → `archived`

### ID Format
`religion_000001`

---

## Language Contract

### Purpose
Defines the data contract for language entities — constructed or natural languages.

### Entity Type
`language`

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Language ID: `language_000001` |
| `type` | string | Yes | Must be `"language"` |
| `name` | string | Yes | Language name |
| `description` | string | Recommended | Language description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Language-specific data |

### Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `family` | string | Optional | Language family |
| `script` | string | Optional | Writing system |
| `phonology` | string | Optional | Sound system description |
| `speakers` | integer | Optional | Estimated speaker count |
| `isConstructed` | boolean | Optional | Whether language is constructed |

### Language Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Parent language family |
| `children` | 0-N | Dialects |
| `related` | 0-N | Related entities (cultures, characters) |

### Lifecycle
`draft` → `developed` → `final` → `archived`

### ID Format
`language_000001`

---

## Lore Contract

### Purpose
Defines the data contract for lore entities — cultural knowledge, mythology, and historical traditions.

### Entity Type
`lore`

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Lore ID: `lore_000001` |
| `type` | string | Yes | Must be `"lore"` |
| `name` | string | Yes | Lore entry name |
| `description` | string | Recommended | Summary |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Lore-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags |

### Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `loreType` | string | Yes | myth, legend, folklore, tradition, ritual, symbol, festival, history |
| `content` | string | Yes | Full lore content |
| `cultureId` | string | Optional | Associated culture ID |
| `origin` | string | Optional | Origin information |
| `significance` | string | Optional | Cultural significance |

### Lore Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Parent lore entry |
| `children` | 0-N | Sub-lore entries |
| `related` | 0-N | Related entities (cultures, events, characters) |

### Lifecycle
`draft` → `reviewed` → `canon` → `archived`

### ID Format
`lore_000001`
