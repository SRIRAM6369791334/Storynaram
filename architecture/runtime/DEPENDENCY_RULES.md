# Dependency Rules

## Layer Rule

Packages may only depend on packages in the same or lower layer:

```
Layer 0: common, config, logger
Layer 1: core, events, telemetry
Layer 2: registry, schema, storage
Layer 3: validation, workflow, ai
Layer 4: plugin-sdk
Layer 5: runtime (orchestrator only)
```

## Allowed Dependencies

| Package | May Depend On |
|---------|---------------|
| common | (none) |
| config | common |
| logger | config |
| core | common |
| events | common |
| telemetry | config, logger |
| registry | core, common, events, config |
| schemas | (none - data only) |
| storage | common, config |
| validation | core, registry, common, events |
| workflow | core, registry, common, events, validation |
| ai | core, registry, common, events, validation |
| plugin-sdk | core, common, events |
| runtime | core, registry, schema, validation, workflow, ai, storage, common, config, logger, events, telemetry |

## Forbidden Dependencies

- Apps may NOT import from other apps
- Packages may NOT import from apps
- Packages may NOT import from plugins
- Plugins may ONLY depend on @storynaram/plugin-sdk
- No circular dependencies: if A → B → C, then C must not → A
- Domain layer (core) must not depend on infrastructure (storage, queue, cache)

## Enforcement

Dependency rules enforced via:
1. ESLint `import/no-restricted-paths`
2. `madge` circular dependency check in CI
3. Structure tests verifying package.json dependencies
4. Code review gate

## Dependency Inversion

Infrastructure packages depend on abstractions in core:
- `Repository` interfaces in core → implementations in infra
- `EventBus` interface in events → implementations in infra
- `StorageService` interface in storage → implementations in infra
