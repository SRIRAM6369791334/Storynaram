# Plugin Composition

## Plugin Lifecycle

```
register → load → initialize → compose → validate → cleanup
```

| Phase | Description |
|-------|-------------|
| `register` | Plugin announces identity, version, and capabilities |
| `load` | Plugin code/data is loaded into memory |
| `initialize` | Plugin sets up internal state |
| `compose` | Plugin contributes fields, components, or logic |
| `validate` | Plugin validates its contributed content |
| `cleanup` | Plugin releases resources |

## Plugin Isolation

- Each plugin runs in a scoped context with no access to other plugins' internals.
- Plugins communicate only through the composition context.
- Plugins cannot modify other plugins' registrations.

## Plugin Dependencies

```yaml
name: combat-effects
version: "1.2.0"
dependsOn:
  - name: combat-core
    version: ">=2.0"
  - name: animation-base
    version: "^1.5"
    optional: true
```

## Conflict Resolution

| Conflict | Resolution |
|----------|-----------|
| Same field, different value | Last-registered plugin wins |
| Same plugin, multiple versions | Highest compatible version |
| Plugin A depends on B, B on A | CircularDependency error |
| Plugin declares conflicting extension points | Reject with ExtensionConflict |

## Mermaid Plugin Architecture

```mermaid
flowchart TD
    subgraph Pipeline
        P1[Register Phase] --> P2[Load Phase]
        P2 --> P3[Initialize Phase]
        P3 --> P4[Compose Phase]
        P4 --> P5[Validate Phase]
        P5 --> P6[Cleanup Phase]
    end
    subgraph Plugins
        PL1[Plugin: Combat] --> P4
        PL2[Plugin: Dialogue] --> P4
        PL3[Plugin: Inventory] --> P4
    end
    P4 -->|merge fields| Result[Composed Template]
```
