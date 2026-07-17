# Validators Directory

## Purpose
The validation rule repository. Every validation rule, strategy, error code, and conformance check used across Storynaram is defined here.

## Responsibility
Documents all validation rules â€” what is validated, how it is validated, what constitutes a pass/fail, and what error codes are returned. Validators ensure every piece of data conforms to the standards and contracts.

## Files (planned)
- ID_VALIDATION.md â€” ID format and uniqueness validation rules
- REFERENCE_VALIDATION.md â€” Reference integrity and resolution rules
- JSON_VALIDATION.md â€” JSON structure and schema validation rules
- NAMING_VALIDATION.md â€” Naming convention conformance rules
- DUPLICATE_VALIDATION.md â€” Duplicate detection rules
- RELATIONSHIP_VALIDATION.md â€” Relationship integrity validation rules
- CONTRACT_VALIDATION.md â€” Contract conformance validation
- ERROR_CODES.md â€” Standardized error code catalog

## Naming Convention
- UPPER_SNAKE_CASE.md â€” consistent with standards directory
- One file per validation concern

## Relationships
- **standards/** defines what validators enforce
- **contracts/** defines data shape validators check
- **types/** defines types used in validation
- **enums/** defines enumerated values validators reference
- **scripts/validation** implements validators programmatically
