# Organization Contract

## Purpose
Defines the data contract for all organization entities in Storynaram — kingdoms, guilds, clans, tribes, armies, religions, secret societies, governments, and companies.

## Entity Type
`organization`

## Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Organization ID matching type prefix |
| `type` | string | Yes | Must be `"organization"` |
| `name` | string | Yes | Organization display name |
| `description` | string | Recommended | Organization description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Organization-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags per TAG_STANDARD |

## Data Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orgType` | string | Yes | kingdom, guild, clan, tribe, army, religion, secret-society, government, company |
| `founded` | object | Recommended | Founding information |
| `founded.year` | integer | Optional | Founding year |
| `founded.by` | string | Optional | Founder character ID |
| `leader` | string | Recommended | Current leader character ID |
| `headquarters` | string | Optional | Primary location ID |
| `territory` | array | Optional | Territory location IDs |
| `members` | object | Recommended | Membership information |
| `members.count` | integer | Optional | Approximate member count |
| `members.notable` | array | Optional | Notable member character IDs |
| `ideology` | string | Optional | Core ideology or mission |
| `structure` | string | Optional | Organizational structure description |
| `hierarchy` | array | Optional | Rank/title hierarchy |
| `alliances` | array | Optional | Allied organization IDs |
| `enemies` | array | Optional | Enemy organization IDs |
| `status` | string | Optional | active, inactive, dissolved, exiled, secret |

## Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 0-1 | Parent organization (for sub-organizations) |
| `children` | 0-N | Sub-organizations |
| `related` | 0-N | Related entities |

## Validation Rules
1. ID prefix must match organization type: `org_kingdom`, `org_guild`, `org_clan`, `org_tribe`, `org_army`, `org_religion`, `org_secret`, `org_government`, `org_company`
2. Referenced leader and members must exist in characters/
3. Referenced territory must exist in world/
4. Referenced alliances/enemies must exist in organizations/

## Lifecycle
`concept` → `active` → `inactive` → `defunct` → `archived`

## Example
```json
{
  "id": "org_guild_000001",
  "type": "organization",
  "name": "The Kingsguard",
  "description": "Elite order of knights sworn to protect the crown",
  "metadata": {
    "version": 1,
    "status": "draft",
    "createdAt": "2026-07-17T12:00:00Z",
    "updatedAt": "2026-07-17T12:00:00Z"
  },
  "data": {
    "orgType": "guild",
    "founded": {
      "year": 1120,
      "by": "hero_000001"
    },
    "leader": "hero_000001",
    "headquarters": "city_000001",
    "members": {
      "count": 150,
      "notable": ["support_000003", "support_000007"]
    },
    "ideology": "Protect the realm",
    "status": "active"
  },
  "relationships": {
    "parent": null,
    "children": [],
    "related": ["kingdom_000001"]
  },
  "tags": ["guild", "military", "elite"]
}
```
