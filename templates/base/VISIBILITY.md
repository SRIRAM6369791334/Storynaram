# BaseVisibility

## Purpose
Controls who can see an entity and in what contexts. Manages publication state, embargoes, and audience targeting.

## Required Fields
| Field | Type | Description |
|-------|------|-------------|
| `visibility` | string | Level: public, private, restricted, internal, hidden, draft |

## Optional Fields
- `published` — publication flag (boolean)
- `publishedAt`, `unpublishedAt` — publication timestamps
- `embargo` — scheduled release settings
- `audience` — required audience labels
- `accessGroups` — access control group identifiers

## Inheritance Rules
- **Final**: `visibility`
- **Overrideable**: `published`, `publishedAt`, `unpublishedAt`, `embargo`, `audience`, `accessGroups`
