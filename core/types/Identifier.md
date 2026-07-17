# Identifier Type

## Purpose
Defines the global unique identifier type used across all Storynaram entities.

## Definition
`json
{
  "type": "string",
  "pattern": "^[a-z]+_[0-9]{6,}$",
  "description": "Globally unique entity identifier"
}
`

## Format
{prefix}_{sequence}

- **prefix**: 2-5 lowercase alphabetic characters
- **separator**: single underscore
- **sequence**: 6+ decimal digits, zero-padded

## Examples
- hero_000001
- city_000042
- event_999999
- item_weapon_000001

## Usage
Used in:
- Entity JSON id field
- All reference fields
- Relationship target fields
- Index entries
- Log entries

## Validation
- Must match pattern ^[a-z]+_[0-9]{6,}$
- Must be globally unique
- Must be permanent (never change or reuse)
- Prefix must match a registered domain prefix
