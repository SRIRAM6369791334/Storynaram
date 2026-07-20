export type PluginId = string;
export type PluginVersion = string;
export type PluginStatus = 'discovered' | 'loaded' | 'initialized' | 'started' | 'stopped' | 'reloaded' | 'disabled' | 'unloaded' | 'destroyed';
export type HookType = 'before' | 'after' | 'around';
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface PluginManifest {
  id: PluginId;
  name: string;
  version: PluginVersion;
  author?: string;
  description?: string;
  license?: string;
  dependencies?: PluginDependency[];
  peerDependencies?: PluginDependency[];
  permissions?: PluginPermission[];
  capabilities?: PluginCapability[];
  entrypoint?: string;
  configurationSchema?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface PluginDependency {
  id: PluginId;
  version?: string;
  optional?: boolean;
}

export interface PluginPermission {
  resource: string;
  actions: string[];
}

export interface PluginCapability {
  name: string;
  version: string;
  description?: string;
}

export interface PluginDescriptor {
  manifest: PluginManifest;
  status: PluginStatus;
  startedAt?: Date;
  stoppedAt?: Date;
  errorCount: number;
  lastError?: string;
  hooks: number;
  metadata: Record<string, unknown>;
}

export interface PluginContext {
  pluginId: PluginId;
  manifest: PluginManifest;
  config: Record<string, unknown>;
  logger: PluginContextLogger;
  services: Record<string, unknown>;
  hooks: PluginContextHooks;
  events: PluginContextEvents;
}

export interface PluginContextLogger {
  info: (msg: string, ...args: unknown[]) => void;
  warn: (msg: string, ...args: unknown[]) => void;
  error: (msg: string, ...args: unknown[]) => void;
  debug: (msg: string, ...args: unknown[]) => void;
}

export interface PluginContextHooks {
  register: (hookName: string, handler: PluginHookHandler, options?: { priority?: number; type?: HookType }) => void;
  unregister: (hookName: string) => void;
}

export interface PluginContextEvents {
  publish: (eventName: string, payload: Record<string, unknown>) => void;
  subscribe: (eventName: string, handler: (payload: Record<string, unknown>) => void) => void;
}

export interface PluginHook {
  pluginId: PluginId;
  hookName: string;
  type: HookType;
  handler: PluginHookHandler;
  priority: number;
  async: boolean;
}

export type PluginHookHandler = (context: PluginHookContext, ...args: unknown[]) => unknown | Promise<unknown>;

export interface PluginHookContext {
  pluginId: PluginId;
  hookName: string;
  proceed: () => unknown | Promise<unknown>;
  stopPropagation: () => void;
  result?: unknown;
}

export interface PluginEvent {
  eventId: string;
  eventType: string;
  pluginId: PluginId;
  timestamp: Date;
  payload: Record<string, unknown>;
}

export interface PluginHealth {
  status: HealthStatus;
  totalPlugins: number;
  activeCount: number;
  failedCount: number;
  lastChecked: Date;
  details: Record<PluginId, PluginHealthEntry>;
}

export interface PluginHealthEntry {
  status: HealthStatus;
  statusMessage?: string;
  uptimeMs?: number;
  lastError?: string;
  lastChecked: Date;
}

export interface PluginMetricsData {
  hookExecutionTime: Record<string, number>;
  lifecycleTime: Record<string, number>;
  errorCount: number;
  requestCount: number;
}

export interface PluginStatistics {
  totalPlugins: number;
  activePlugins: number;
  stoppedPlugins: number;
  failedPlugins: number;
  totalHooks: number;
  totalCapabilities: number;
  averageLoadTimeMs: number;
  totalErrors: number;
}

export interface PluginRuntimeOptions {
  autoStart?: boolean;
  enableHooks?: boolean;
  enableEventBridge?: boolean;
  enablePermissions?: boolean;
  enableMetrics?: boolean;
  enableHealthChecks?: boolean;
  defaultConfig?: Record<PluginId, Record<string, unknown>>;
  pluginBasePath?: string;
  healthCheckIntervalMs?: number;
}

export interface PluginLoadedEvent {
  pluginId: PluginId;
  name: string;
  version: PluginVersion;
  timestamp: Date;
}

export interface PluginStartedEvent {
  pluginId: PluginId;
  name: string;
  version: PluginVersion;
  timestamp: Date;
}

export interface PluginStoppedEvent {
  pluginId: PluginId;
  name: string;
  version: PluginVersion;
  timestamp: Date;
}

export interface PluginFailedEvent {
  pluginId: PluginId;
  name: string;
  version: PluginVersion;
  error: string;
  timestamp: Date;
}

export interface PluginReloadedEvent {
  pluginId: PluginId;
  name: string;
  version: PluginVersion;
  timestamp: Date;
}
