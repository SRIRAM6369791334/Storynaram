# Security Model

## Threat Vectors

| Threat | Risk | Mitigation |
|--------|------|------------|
| Template injection | Critical | Schema validation, input sanitization |
| Validation rule injection | High | Sandboxed rule execution |
| Registry poisoning | Critical | Registry integrity verification |
| Plugin sandbox escape | High | Process isolation, capability restrictions |
| Entity document tampering | High | Checksum verification |
| Reference traversal | Medium | Circular reference guards |
| Denial of service (deep templates) | Medium | Depth limits, timeouts |

## Template Injection Prevention

- All template input is parsed through a strict schema validator before processing.
- Arbitrary YAML tags are rejected (`!tag` syntax).
- Field names are restricted to alphanumeric + underscore pattern.
- Maximum field value length: 10,000 characters.
- Maximum nesting depth: 10 levels.

## Validation Rule Injection

- Custom validation rules run in a sandboxed environment without filesystem or network access.
- Rules have a CPU execution budget (max 10ms) and memory budget (max 1MB).
- Rules cannot import or require external modules.
- Rule output is limited to boolean + message string.

## Registry Integrity

- Template registry is signed with an Ed25519 key.
- Registry signature is verified on load.
- Tampered entries are rejected with `IntegrityViolation` error.
- Registry updates require authentication.

## Plugin Sandboxing

| Capability | Default | Configurable |
|------------|---------|-------------|
| Filesystem read | No | Yes |
| Filesystem write | No | No |
| Network access | No | Yes (URL allowlist) |
| Process spawning | No | No |
| Entity data read | Yes | Yes |
| Entity data write | Yes (scoped) | Yes |

## Input Sanitization

- YAML parsing uses safe loader only (no arbitrary object creation).
- HTML/script tags in string fields are stripped.
- Bidirectional text markers are validated.
- File paths in templates are validated against allowed base directories.
