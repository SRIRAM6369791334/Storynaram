export interface RepositoryRuntimeContract {
  getRepository(entityType: string): unknown;
}

export interface WorkflowRuntimeContract {
  startWorkflow(workflowName: string, payload: unknown): Promise<void>;
  triggerEvent(eventType: string, payload: unknown): Promise<void>;
}

export interface ValidationRuntimeContract {
  validate(schema: unknown, data: unknown): Promise<{ valid: boolean; errors: string[] }>;
}

export interface AIRuntimeContract {
  generate(prompt: string, options?: Record<string, unknown>): Promise<string>;
  embed(text: string): Promise<number[]>;
}

export interface PluginRuntimeContract {
  executeHook(hookName: string, context: Record<string, unknown>): Promise<unknown>;
  getPlugin(name: string): unknown;
}

export interface SearchProviderContract {
  index(entityType: string, id: string, body: Record<string, unknown>): Promise<void>;
  search(entityType: string, query: Record<string, unknown>): Promise<unknown>;
  deleteIndex(entityType: string, id: string): Promise<void>;
}

export interface StorageProviderContract {
  store(path: string, data: Buffer | string): Promise<void>;
  retrieve(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}
