# JSON Validation

## Purpose
Defines validation rules for JSON structure, formatting, and schema conformance.

## Validation Rules

### Rule JSON-V001: Syntax Check
- **Description**: File must contain valid JSON
- **Check**: JSON.parse succeeds
- **Severity**: critical
- **Auto-fix**: false

### Rule JSON-V002: Encoding Check
- **Description**: File must be UTF-8 without BOM
- **Check**: Byte order mark is absent
- **Severity**: error
- **Auto-fix**: true (strip BOM)

### Rule JSON-V003: Indentation Check
- **Description**: JSON must use 2-space indentation
- **Check**: No tabs, correct space count
- **Severity**: warning
- **Auto-fix**: true (re-indent)

### Rule JSON-V004: Required Fields Check
- **Description**: All required fields per schema must be present
- **Check**: Schema validation passes
- **Severity**: error
- **Auto-fix**: false

### Rule JSON-V005: Type Check
- **Description**: Field types must match schema
- **Check**: typeof matches schema type definition
- **Severity**: error
- **Auto-fix**: false

### Rule JSON-V006: Trailing Newline Check
- **Description**: File must end with a single trailing newline
- **Check**: Last character is LF
- **Severity**: warning
- **Auto-fix**: true (add trailing newline)

## Error Codes
| Code | Rule | Message |
|------|------|---------|
| E1001 | JSON-V001 | "Invalid JSON syntax in file: {path}" |
| E1002 | JSON-V002 | "File is not UTF-8 or has BOM: {path}" |
| W1001 | JSON-V003 | "Incorrect indentation in: {path}" |
| E1003 | JSON-V004 | "Missing required field: {field}" |
| E1004 | JSON-V005 | "Type mismatch for field {field}: expected {expected}, got {actual}" |
| W1002 | JSON-V006 | "Missing trailing newline in: {path}" |
