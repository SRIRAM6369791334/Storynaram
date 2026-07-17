# ID Validation

## Purpose
Defines validation rules for entity ID format and uniqueness.

## Validation Rules

### Rule ID-V001: Format Check
- **Description**: ID must match pattern {prefix}_{sequence}
- **Pattern**: ^[a-z]+_[0-9]{6,}$
- **Severity**: error
- **Auto-fix**: false

### Rule ID-V002: Prefix Check
- **Description**: ID prefix must be a registered domain prefix
- **Check**: Prefix exists in ID_STANDARD.md prefix table
- **Severity**: error
- **Auto-fix**: false

### Rule ID-V003: Uniqueness Check
- **Description**: ID must be globally unique across the entire project
- **Check**: No other file has the same ID
- **Severity**: critical
- **Auto-fix**: false

### Rule ID-V004: Sequence Check
- **Description**: Sequence must be numeric, zero-padded, minimum 6 digits
- **Pattern**: [0-9]{6,}
- **Severity**: error
- **Auto-fix**: true (re-pad to 6 digits)

### Rule ID-V005: Permanence Check
- **Description**: ID must not match any archived entity ID
- **Check**: Archived entity index does not contain this ID
- **Severity**: critical
- **Auto-fix**: false

## Error Codes
| Code | Rule | Message |
|------|------|---------|
| E2001 | ID-V001 | "Invalid ID format: {id}" |
| E2002 | ID-V002 | "Unknown ID prefix: {prefix}" |
| E2003 | ID-V003 | "Duplicate ID: {id}" |
| E2004 | ID-V004 | "Invalid sequence format: {sequence}" |
| E2005 | ID-V005 | "ID matches archived entity: {id}" |
