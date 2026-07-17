# Plugin Architecture

## Plugin Manifest

Every plugin must provide a `plugin.json` manifest:

```json
{
  "id": "storynaram-plugin-example",
  "name": "Example Plugin",
  "version": "1.0.0",
  "minRuntimeVersion": "2.0.0",
  "maxRuntimeVersion": "3.0.0",
  "entryPoint": "./dist/index.js",
  "capabilities": ["validation:custom", "workflow:action"],
  "permissions": ["storage:read", "entity:read"],
  "dependencies": {
    "@storynaram/plugin-sdk": "^1.0.0"
  },
  "hooks": ["entity.created", "workflow.transitioned"],
  "configSchema": { "type": "object", "properties": {} }
}
```

## Plugin Interface

```typescript
interface StorynaramPlugin {
  id: string;
  version: string;
  
  onLoad(context: PluginContext): Promise<void>;
  onUnload(): Promise<void>;
  onActivate(): Promise<void>;
  onDeactivate(): Promise<void>;
  onError(error: Error): Promise<void>;
  
  getCapabilities(): string[];
  getHooks(): string[];
}
```

## Plugin Lifecycle

1. **Discovered** — Filesystem scan or registry entry
2. **Validated** — Manifest schema validation
3. **Loaded** — Module imported, dependencies resolved
4. **Initialized** — `onLoad()` called with PluginContext
5. **Activated** — `onActivate()` called, hooks registered
6. **Running** — Serving requests, handling hooks
7. **Deactivated** — `onDeactivate()` called, hooks unregistered
8. **Unloaded** — `onUnload()` called, resources released

## Plugin Isolation

| Concern | Strategy |
|---------|----------|
| Filesystem | Limited to plugin directory |
| Network | Restricted by capability declaration |
| Dependencies | NPM dependencies bundled/checked |
| Errors | Sandboxed — plugin crash doesn't affect host |
| Permissions | Declared in manifest, enforced at runtime |
| Resource limits | CPU/memory monitoring, timeout enforcement |

## Plugin Capability Model

| Capability | Scope | Permission Required |
|------------|-------|-------------------|
| validation:custom | Define custom validation rules | validation:execute |
| workflow:action | Define workflow actions | workflow:execute |
| workflow:guard | Define transition guards | workflow:read |
| ai:provider | Register AI model provider | ai:execute |
| ai:strategy | Define reasoning strategy | ai:execute |
| storage:provider | Register storage backend | storage:write |
| entity:hook | React to entity events | entity:read |
| event:handler | Subscribe to events | event:read |
| api:endpoint | Register API routes | api:register |

## Plugin Discovery

- Directory-based: `plugins/*/` scanned at startup
- Registry-based: plugin-registry.json provides additional discovery
- Dynamic: Hot-plug capable via PluginModule API
