# Timeline Entities Contracts

## Calendar, War, Battle, Prophecy, Quest

---

## Calendar Contract

### Purpose
Defines the data contract for calendar systems used in-story for date tracking.

### Entity Type
`calendar`

### Ownership
Owned by Timeline.

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Calendar ID: `calendar_000001` |
| `type` | string | Yes | Must be `"calendar"` |
| `name` | string | Yes | Calendar name |
| `description` | string | Recommended | Calendar description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Calendar-specific data |

### Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `months` | array | Yes | Month names and day counts |
| `daysPerWeek` | integer | Yes | Days in a week |
| `weekNames` | array | Optional | Names of weekdays |
| `leapRule` | string | Optional | Leap year rule |
| `epoch` | string | Optional | Calendar epoch name |
| `epochYear` | integer | Optional | Starting year of epoch |

### Calendar Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 1 | Timeline ID |
| `children` | 0-N | Calendar events |
| `related` | 0-N | Related entities |

### Calendar Validation Rules
1. Months array must have at least 1 entry
2. Days per week must be positive

### Lifecycle
`draft` → `active` → `archived`

### ID Format
`calendar_000001`

---

## War Contract

### Purpose
Defines the data contract for wars and armed conflicts between groups.

### Entity Type
`war`

### Ownership
Owned by Era / Timeline.

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | War ID: `war_000001` |
| `type` | string | Yes | Must be `"war"` |
| `name` | string | Yes | War name |
| `description` | string | Recommended | War description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | War-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags |

### Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `startDate` | object | Yes | Start date (year/month/day) |
| `endDate` | object | Optional | End date (null if ongoing) |
| `combatants` | array | Recommended | Organization IDs involved |
| `outcome` | string | Optional | Outcome description |
| `casualties` | integer | Optional | Estimated casualties |
| `cause` | string | Optional | Root cause |
| `battles` | array | Optional | Battle IDs |

### War Validation Rules
1. Start date must be before end date
2. At least 2 combatants required

### Lifecycle
`proposed` → `planned` → `active` → `resolved` → `canon` → `archived`

### ID Format
`war_000001`

---

## Battle Contract

### Purpose
Defines the data contract for individual battles within a war.

### Entity Type
`battle`

### Ownership
Owned by War.

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Battle ID: `battle_000001` |
| `type` | string | Yes | Must be `"battle"` |
| `name` | string | Yes | Battle name |
| `description` | string | Recommended | Battle description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Battle-specific data |
| `relationships` | object | Yes | Relationship references |

### Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | object | Yes | Battle date |
| `locationId` | string | Yes | Location ID |
| `participants` | array | Recommended | Organization/Character IDs |
| `outcome` | string | Optional | Victory/defeat/stalemate |
| `casualties` | integer | Optional | Casualty count |
| `significance` | string | Optional | Strategic significance |

### Battle Validation Rules
1. Battle date must be within parent war's date range

### Lifecycle
`proposed` → `planned` → `fought` → `recorded` → `archived`

### ID Format
`battle_000001`

---

## Prophecy Contract

### Purpose
Defines the data contract for prophecies — predictions of future events.

### Entity Type
`prophecy`

### Ownership
Owned by Timeline.

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Prophecy ID: `prophecy_000001` |
| `type` | string | Yes | Must be `"prophecy"` |
| `name` | string | Yes | Prophecy name |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Prophecy-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags |

### Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | Prophecy text |
| `prophesiedDate` | object | Optional | When prophecy was made |
| `fulfillmentDate` | object | Optional | When prophecy was fulfilled |
| `fulfilled` | boolean | Yes | Whether prophecy is fulfilled |
| `fulfillmentEventId` | string | Optional | Event that fulfilled it |
| `prophetId` | string | Optional | Character who prophesied |
| `interpretation` | string | Optional | Accepted interpretation |

### Prophecy Validation Rules
1. If fulfilled, fulfillment date must be after prophesied date

### Lifecycle
`prophesied` → `fulfilled` | `broken` → `archived`

### ID Format
`prophecy_000001`

---

## Quest Contract

### Purpose
Defines the data contract for quests and missions — objectives undertaken by characters.

### Entity Type
`quest`

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Quest ID: `quest_000001` |
| `type` | string | Yes | Must be `"quest"` |
| `name` | string | Yes | Quest name |
| `description` | string | Recommended | Quest description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Quest-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags |

### Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `giverId` | string | Optional | Quest giver character ID |
| `receiverIds` | array | Recommended | Quest receiver character IDs |
| `objectives` | array | Yes | Quest objectives |
| `reward` | object | Optional | Reward description |
| `status` | string | Yes | active, completed, failed, abandoned |
| `difficulty` | string | Optional | difficulty rating |

### Quest Validation Rules
1. At least 1 objective required
2. Referenced characters must exist

### Lifecycle
`offered` → `accepted` → `active` → `completed` | `failed` | `abandoned`

### ID Format
`quest_000001`
