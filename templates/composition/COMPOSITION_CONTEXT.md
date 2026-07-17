# Composition Context

## 8 Runtime Context Types

### EntityContext

Carries the entity being composed: `$id`, `$type`, `version`, resolved template chain, field values.

### AIContext

Carries AI interaction state: prompt history, model configuration, generation parameters, token budget, response stream.

### MemoryContext

Carries entity memory: short-term (session) and long-term (persistent) memory blocks, memory decay parameters, recall triggers.

### StoryContext

Carries narrative state: current scene, active quests, world state flags, timeline position, branch choices.

### SessionContext

Carries session data: session ID, authenticated user, permissions, rate limits, feature flags.

### ValidationContext

Carries validation state: current stage, accumulated errors, warning list, skipped stages, override overrides.

### PluginContext

Carries plugin sandbox: loaded plugins, their permissions, contributed fields, inter-plugin communication channel.

### RequestContext

Carries the triggering request: HTTP headers, API version, client capabilities, request ID, trace ID.

## Context Propagation Rules

| Rule | Description |
|------|-------------|
| **Forward-only** | Contexts flow forward through the pipeline; no back-propagation. |
| **Immutable past** | Completed pipeline stages cannot modify context. |
| **Scoped write** | A stage may only write to its own context type. |
| **Read-all** | Any stage may read any context type. |
| **Merge on fork** | When branching (e.g., parallel validation), child contexts merge back to parent. |

## Context Lifetime

```
RequestContext ──► SessionContext ──► EntityContext ──► StoryContext
                       │                   │
                       ▼                   ▼
                  MemoryContext       AIContext
                       │                   │
                       ▼                   ▼
                  ValidationContext   PluginContext
```

Contexts are created before pipeline start and destroyed after pipeline completion.
