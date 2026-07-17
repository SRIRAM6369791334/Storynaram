# BaseIdentifier

## Purpose
Uniquely identifies every entity in the system. Guarantees global uniqueness across all entity types.

## Responsibilities
- Generate and validate globally unique IDs in format `{prefix}_{sequence}`
- Map prefixes to entity types via `config/id_rules.json`
- Support legacy ID migration tracking
- Provide namespace isolation for multi-project/tenant setups

## Required Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Globally unique ID: `{prefix}_{sequence}` |
| `prefix` | string | Entity type prefix from id_rules.json |
| `sequence` | string | Zero-padded numeric sequence (min 6 digits) |
| `type` | string | Canonical entity type name |

## Optional Fields
- `displayId` — human-readable alternate ID
- `namespace` — project/tenant namespace qualifier
- `legacyIds` — array of legacy ID mappings

## Dependencies
- `config/id_rules.json` — prefix registry

## Examples

```json
{ "prefix": "char", "sequence": "000001", "type": "character" }
{ "prefix": "world", "sequence": "000042", "type": "world" }
{ "prefix": "item", "sequence": "000927", "type": "item" }
```

## Inheritance Rules
- **Final** (not overrideable): `id`, `prefix`, `sequence`, `type`
- **Overrideable**: `displayId`, `namespace`, `legacyIds`
- Must be present on every entity (required by BaseEntity)

## Validation Rules
- `id` must match regex `^[a-z]+_[0-9]{6,}$`
- `prefix` must be registered in `config/id_rules.json`
- `sequence` must be minimum 6 digits, zero-padded
- `type` must be a valid canonical entity type name

## Future Extensions
- ULID or UUIDv7 generation as alternative to sequential IDs
- Multi-region ID generation with region prefixes
- CQRS-style command IDs and event IDs
