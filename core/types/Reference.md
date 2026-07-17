# Reference Type

## Purpose
Defines the cross-entity reference type.

## Definition
`json
{
  "type": "string",
  "pattern": "^[a-z]+_[0-9]{6,}$",
  "description": "Reference to another entity by its Identifier"
}
`

## Usage
References are stored as:
1. **Single reference**: a string containing the target entity ID
2. **Array reference**: an array of target entity IDs
3. **Typed reference**: an object with id, type, and optional role

## Examples
### Single
`json
"currentLocation": "city_000001"
`

### Array
`json
"characters": ["hero_000001", "heroine_000002"]
`

### Typed
`json
{
  "id": "hero_000001",
  "type": "character",
  "role": "protagonist"
}
`

## Validation
- Referenced ID must exist
- Referenced entity must not be archived
- Circular references beyond 10 levels are flagged
