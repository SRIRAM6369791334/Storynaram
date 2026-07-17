# Quality Gates for Schema Acceptance

All schemas must pass the applicable quality gates before being merged. Gates are enforced by the CI pipeline at different stages of the schema lifecycle.

## Gate Definitions

| Gate | Requirement | Tool | Lifecycle Stage |
|------|-------------|------|:---------------:|
| QG-1 | Valid Draft 2020-12 JSON Schema | JSON Schema validator | All |
| QG-2 | All `$ref` targets resolve to existing schemas | Reference checker | All |
| QG-3 | No circular dependencies in schema references | Dependency analyzer | All |
| QG-4 | Naming convention compliance (see SCHEMA_NAMING_STANDARD.md) | Linter | All |
| QG-5 | Documentation complete (description, title, README if required) | Doc coverage tool | experimental+ |
| QG-6 | Backward compatible with previous version (or correctly classified as MAJOR) | Compatibility analyzer | stable |
| QG-7 | All provided test examples validate against the schema | Example validator | experimental+ |
| QG-8 | Registry entry exists and is accurate | Registry checker | experimental+ |

## Gate Details

### QG-1: Valid Draft 2020-12

The schema must be syntactically valid according to JSON Schema Draft 2020-12. The validator checks:

- Correct keyword usage for the dialect
- Proper `$schema` declaration
- Valid `$id` format
- No unknown keywords (unless allowed via `unevaluatedProperties`)
- Correct `$defs` structure

### QG-2: All `$ref` Targets Resolve

Every `$ref` in the schema must resolve to an existing schema file. References are resolved relative to the schema's `$id`. External references (to other categories) are checked against the dependency registry.

### QG-3: No Circular Dependencies

The dependency analyzer builds a reference graph and detects cycles. Schemas must not form circular dependency chains. Allowed exceptions:

- Self-references within a single schema (valid)
- Mutually referencing schemas belonging to the same category (review required)

### QG-4: Naming Convention Compliance

The linter checks:

- Schema file name matches PascalCase convention
- `$id` URI follows `https://storynaram.dev/schemas/{category}/{Name}.schema.json`
- `$defs` entries are PascalCase and singular
- Properties are camelCase
- Enum values are kebab-case for multi-word values

### QG-5: Documentation Complete

The documentation coverage tool checks:

- `title` present and non-empty
- `description` present and non-empty
- For experimental+: README file exists in the schema directory
- For stable+: Cross-schema impact section documented

### QG-6: Backward Compatible

The compatibility analyzer compares the new schema against the previous version:

- Identifies breaking changes
- If breaking changes detected, verifies MAJOR version bump
- If no breaking changes, verifies MINOR or PATCH version bump
- Generates a compatibility report

### QG-7: Test Examples Valid

All examples in the schema's `examples` array or in the accompanying `examples/` directory must:

- Validate against the schema
- Be representative of real-world usage
- Cover edge cases (for stable schemas)

### QG-8: Registry Entry Exists

The registry checker verifies:

- An entry exists in the appropriate category registry file
- Version matches the schema's metadata
- Lifecycle status matches the intended state
- Dependency entries are complete
- `$id` matches the registry entry

## Gate Matrix by Lifecycle Stage

| Gate | draft | experimental | stable | deprecated | archived |
|------|:-----:|:------------:|:------:|:----------:|:--------:|
| QG-1 | ✓ | ✓ | ✓ | ✓ | ✓ |
| QG-2 | ✓ | ✓ | ✓ | ✓ | ✓ |
| QG-3 | ✓ | ✓ | ✓ | ✓ | ✓ |
| QG-4 | ✓ | ✓ | ✓ | ✓ | ✓ |
| QG-5 | — | ✓ | ✓ | ✓ | — |
| QG-6 | — | — | ✓ | — | — |
| QG-7 | — | ✓ | ✓ | — | — |
| QG-8 | — | ✓ | ✓ | ✓ | ✓ |

## Failure Handling

- **QG-1 through QG-4**: Blocking. Merge cannot proceed.
- **QG-5 through QG-8**: Blocking for the applicable lifecycle stage. Waived only by Review Board exception.
- Gate failures produce a report with the specific location and nature of the failure.

## Gate Waivers

A gate waiver may be requested by the Schema Owner when:

- A gate is technically not applicable (documented rationale required)
- A temporary exception is needed (expires after a set date)
- The schema is in `draft` and QG-5/QG-7/QG-8 are not yet required

Waivers must be approved by the Review Board and recorded in the schema's RFC.
