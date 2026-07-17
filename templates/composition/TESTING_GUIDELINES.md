# Testing Guidelines

## Testing Strategy

| Test Level | Scope | Frequency |
|------------|-------|-----------|
| Unit | Single pipeline stage | Per commit |
| Integration | Full pipeline (stages 1-10) | Per PR |
| Regression | Known-good entity compositions | Per release |
| Performance | Composition timing | Per release |
| Chaos | Malformed inputs, missing deps, cycles | Per milestone |

## Unit Test Categories

### Merge Tests

- Deep merge overwrites primitives correctly.
- Array concatenation deduplicates properly.
- Nested object merge preserves unrelated keys.
- Null values clear fields, undefined is skipped.

### Override Tests

- `final` fields reject entity overrides.
- `protected` fields accept child template overrides but reject entity overrides.
- `overrideable` fields accept all overrides.
- Extension-only fields reject template and entity overrides.

### Validation Tests

- Required field missing → correct error.
- Type mismatch (string vs number) → correct error.
- Range violations (min/max) → correct error.
- Pattern violations (regex) → correct error.

### Conflict Tests

- Duplicate `$id` → `DuplicateIdentifier` error.
- Duplicate fields → last-write-wins.
- Extension conflicts → priority-based resolution.
- Version conflicts → rejection or range intersection.

## Integration Test Pattern

```yaml
# test/fixtures/test-entity.yaml
$schema: entity
$type: player
template: entity/character/player
fields:
  name: "Test Hero"
  stats:
    hp: 100
    mp: 50
expect:
  success: true
  resolvedFields:
    stats.hp: 100
    stats.mp: 50
    stats.armor: 10  # from domain template
  errors: []
```

## Regression Test Suite

- Maintain a suite of `known-good` entities that must always compose successfully.
- Add a regression test for every bug found.
- Regression tests are run before every release.

## Test Coverage Targets

| Area | Target |
|------|--------|
| Pipeline stages | 100% |
| Error types | 100% |
| Merge strategies | 100% |
| Override modifiers | 100% |
| Conflict resolution types | 100% |
