# Reference Validation

## Purpose
Defines validation rules for cross-entity reference integrity.

## Validation Rules

### Rule REF-V001: Existence Check
- **Description**: Referenced entity ID must exist in the project
- **Check**: File with matching ID exists
- **Severity**: error
- **Auto-fix**: false

### Rule REF-V002: Type Check
- **Description**: Referenced entity type must match expected type
- **Check**: Target entity's type field matches expected
- **Severity**: error
- **Auto-fix**: false

### Rule REF-V003: Bidirectional Check
- **Description**: If A references B, B should reference A (when applicable)
- **Check**: B has an inverse reference to A
- **Severity**: warning
- **Auto-fix**: false

### Rule REF-V004: Circular Chain Check
- **Description**: Circular reference chains must not exceed 10 levels
- **Check**: Walk reference chain depth
- **Severity**: warning
- **Auto-fix**: false

### Rule REF-V005: Duplicate Check
- **Description**: No duplicate entries in reference arrays
- **Check**: Array contains unique values
- **Severity**: warning
- **Auto-fix**: true (remove duplicates)

### Rule REF-V006: Archived Entity Check
- **Description**: References must not point to archived entities
- **Check**: Target entity status is not "archived"
- **Severity**: error
- **Auto-fix**: false

## Error Codes
| Code | Rule | Message |
|------|------|---------|
| E3001 | REF-V001 | "Referenced entity not found: {ref}" |
| E3002 | REF-V002 | "Reference type mismatch: expected {expected}, got {actual}" |
| W3001 | REF-V003 | "Missing inverse reference from {ref} to {id}" |
| W3002 | REF-V004 | "Circular reference chain exceeds 10 levels" |
| W3003 | REF-V005 | "Duplicate reference: {ref}" |
| E3003 | REF-V006 | "Reference to archived entity: {ref}" |
