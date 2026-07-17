# BaseValidation

## Purpose
Defines validation rules per entity type. Supports field-level rules, business rules, custom validators, and trigger scoping.

## Required Fields
None (all optional)

## Optional Fields
- `rules` — field-level validation rules (required, regex, enum, length, range, reference, unique)
- `businessRules` — higher-level business invariants
- `customValidators` — references to validator plugins
- `validateOn` — trigger events (create, update, publish, import, export, transition)

## Inheritance Rules
- **Final**: none
- **Overrideable**: `rules`, `businessRules`, `customValidators`, `validateOn`
