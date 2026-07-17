# Schema Discovery System

The schema discovery system provides multiple mechanisms for locating, resolving, and navigating Storynaram schemas.

## Discovery Mechanisms

### 1. Flat-File Discovery

Index files in `schemas/discovery/` provide a flat listing of all schemas:

| File | Contents |
|------|----------|
| `core-index.json` | All Core schemas |
| `entity-index.json` | All Entity schemas |
| `state-index.json` | All State schemas |
| `narrative-index.json` | All Narrative schemas |
| `media-index.json` | All Media schemas |
| `master-index.json` | Consolidated index of all schemas across categories |

Each index entry contains: `$id`, `title`, `version`, `lifecycleStatus`, and file path.

### 2. Registry-Based Discovery

JSON registries in `schemas/registry/` provide authoritative metadata:

| Registry | Contents |
|----------|----------|
| `core-registry.json` | Core schemas with full metadata |
| `entity-registry.json` | Entity schemas with full metadata |
| `state-registry.json` | State schemas with full metadata |
| `narrative-registry.json` | Narrative schemas with full metadata |
| `media-registry.json` | Media schemas with full metadata |

Registry entries include: `$id`, `title`, `version`, `lifecycleStatus`, `dependencies`, `consumers`, `compatibility`, and `changelog`.

### 3. Cross-Reference Discovery

Dependency and reference registries enable graph-based discovery:

| Registry | Contents |
|----------|----------|
| `dependency-registry.json` | Maps each schema to its direct dependencies |
| `reference-registry.json` | Maps each schema to all schemas that reference it |
| `consumer-registry.json` | Maps each schema to known consuming systems |

### 4. Automated Discovery (Future)

The Storynaram Runtime Engine will implement automated `$ref` resolution:

- Resolves `$ref` chains at runtime
- Detects and caches resolved schemas
- Provides schema resolution API for consumers
- Reports unresolved references and circular dependencies

## Search Patterns

Schemas can be discovered using the following search dimensions:

| Pattern | Description | Example |
|---------|-------------|---------|
| By category | List all schemas in a category | All State schemas |
| By entity type | Find a specific entity | `Character` schema |
| By dependency | Find schemas that depend on a given schema | Schemas referencing `BaseEntity` |
| By consumer | Find schemas consumed by a given system | Schemas used by rendering engine |
| By lifecycle status | Filter by state | All `deprecated` schemas |
| By version range | Schemas matching a version constraint | Core schemas >= 2.0.0 |
| Full-text | Search by keyword in title or description | Schemas with "transition" in name |

## Discovery Flow

```
                         ┌─────────────────┐
                         │    Registry      │
                         │  (entry point)   │
                         └────────┬────────┘
                                  ↓
                         ┌─────────────────┐
                         │     Index        │
                         │  (flat listing)  │
                         └────────┬────────┘
                                  ↓
                         ┌─────────────────┐
                         │   Schema File    │
                         │  (full content)  │
                         └────────┬────────┘
                                  ↓
                    ┌─────────────┴─────────────┐
                    ↓                           ↓
           ┌─────────────────┐       ┌─────────────────┐
           │  Dependencies    │       │   Consumers      │
           │  (depends-on)   │       │  (depended-by)   │
           └─────────────────┘       └─────────────────┘
```

### Typical Discovery Sequence

1. Start with the **Registry** for the desired category
2. Locate the schema entry by name or `$id`
3. Cross-reference to the **Index** for file path location
4. Read the **Schema File** for the full definition
5. Navigate to **Dependencies** via the dependency registry
6. Identify **Consumers** via the consumer registry for impact analysis

## Query Examples

```json
// Find all stable entity schemas
{
  "category": "entity",
  "lifecycleStatus": "stable"
}

// Find all schemas that reference InventoryItem
{
  "dependsOn": "https://storynaram.dev/schemas/entity/InventoryItem.schema.json"
}

// Find all experimental state schemas
{
  "category": "state",
  "lifecycleStatus": "experimental"
}
```

## Tooling Support

| Tool | Discovery Feature |
|------|-------------------|
| `schema-cli discover` | CLI-based schema search |
| `schema-cli resolve` | Resolve `$ref` chains for a schema |
| `schema-cli graph` | Visualize dependency graph |
| `schema-cli impact` | Impact analysis for schema changes |
