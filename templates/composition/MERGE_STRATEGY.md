# Merge Strategy

## Merge Rules by Data Type

### Objects (Deep Merge)

All objects are deep-merged recursively. Nested keys from source and target are combined. Conflicting leaf values follow primitive rules.

```yaml
base: { stats: { hp: 100, mp: 50 }, tags: ["creature"] }
domain: { stats: { hp: 120, armor: 10 }, tags: ["undead"] }
result: { stats: { hp: 120, mp: 50, armor: 10 }, tags: ["creature", "undead"] }
```

### Arrays (Concatenation + Deduplication)

Arrays are concatenated. Duplicate entries (by identity or designated key) are removed:

- **Primitive arrays**: dedup by value (`[1, 2, 2, 3]` → `[1, 2, 3]`)
- **Object arrays**: dedup by `$id` or `name` field if present

### Primitives (Last-Write-Wins)

| Primitive Type | Rule |
|----------------|------|
| string | Last write wins |
| number | Last write wins |
| boolean | Last write wins |
| null | Null clears the field |
| undefined | No-op (skipped) |

## Merge Order

Merge proceeds in a fixed priority chain:

1. **Defaults** (bottom of inheritance chain)
2. **Base template** fields
3. **Inherited template** fields (walked root-to-leaf)
4. **Domain templates** (in declared order)
5. **Extension fields** (in registration order)
6. **Plugin fields** (in dependency order)
7. **Entity document** overrides (highest priority)

Each step deep-merges into the accumulating result. Later steps overwrite earlier ones per the rules above.
