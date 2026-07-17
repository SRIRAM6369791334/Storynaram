# Validation Standard

## Purpose
Defines the validation strategy, validation levels, error handling, and compliance rules for all Storynaram data.

## Validation Architecture
`
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Layer 1: Syntax    â”‚  JSON validity, UTF-8, formatting
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Layer 2: Schema    â”‚  Field types, required fields, structure
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Layer 3: Format    â”‚  ID format, date format, pattern matching
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Layer 4: Reference â”‚  Reference integrity, bidirectionality
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Layer 5: Business  â”‚  Business rules, cross-field constraints
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Layer 6: Canon     â”‚  Canon consistency, historical accuracy
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
`

## Layer 1: Syntax Validation
- Valid JSON syntax
- Correct encoding (UTF-8 without BOM)
- 2-space indentation
- No trailing whitespace
- Trailing newline present
- No duplicate keys

## Layer 2: Schema Validation
- Required fields present
- Field types match schema
- Field values within allowed ranges
- Array items match schema
- Object structure matches schema
- See SCHEMA_STANDARD.md

## Layer 3: Format Validation
- ID format: {prefix}_{sequence} (6+ digits)
- Date format: ISO 8601
- Name format: Title Case
- Tag format: lowercase, hyphen-separated
- Reference format: valid entity ID

## Layer 4: Reference Validation
- Referenced entity exists
- Referenced entity is not archived/deleted
- Bidirectional references are consistent
- No circular reference chains beyond 10 levels
- No duplicate entries in reference arrays

## Layer 5: Business Rule Validation
- Domain-specific business rules per contract
- Cross-field consistency (e.g., deathDate must be after birthDate)
- Status lifecycle transitions (draft â†’ review â†’ final, not final â†’ draft)
- Numeric constraints (age > 0, population >= 0)

## Layer 6: Canon Validation
- Entity does not contradict established canon
- Changes from previous versions are documented
- Canon status transitions are valid
- Cross-entity consistency maintained

## Validation Results
Every validation run produces a structured result:

`json
{
  "timestamp": "2026-07-17T12:00:00Z",
  "validator": "schema_validator",
  "version": "1.0.0",
  "total": 150,
  "passed": 145,
  "failed": 5,
  "errors": [
    {
      "entityId": "hero_000042",
      "field": "metadata.status",
      "errorCode": "E1001",
      "severity": "error",
      "message": "Invalid status value: 'unknown'",
      "expected": "One of: draft, review, revised, final, published, archived, deprecated"
    }
  ],
  "warnings": [
    {
      "entityId": "hero_000007",
      "field": "description",
      "errorCode": "W1001",
      "severity": "warning",
      "message": "Missing recommended field: description"
    }
  ]
}
`

## Error Severity Levels
| Level | Code | Action |
|-------|------|--------|
| Critical | CRIT | Must fix before any further operations |
| Error | ERR | Must fix before finalization |
| Warning | WARN | Should fix, non-blocking |
| Info | INFO | Advisory, no action required |

## Error Code Format
{Category}{Number} â€” examples:
- E1001 â€” Invalid status value
- E2001 â€” Invalid ID format
- E3001 â€” Broken reference
- E4001 â€” Business rule violation
- E5001 â€” Canon conflict

## Validation Automation
- All validation levels should be automatable via scripts/validation/
- Validation scripts are documented in core/validators/
- Validation results are logged to logs/
- Failed validations are recorded in memory/consistency/
