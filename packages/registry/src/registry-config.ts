export class RegistryConfig {
  readonly cacheEnabled: boolean;
  readonly cacheTtlMs: number;

  constructor(data?: Partial<RegistryConfig>) {
    this.cacheEnabled = data?.cacheEnabled ?? true;
    this.cacheTtlMs = data?.cacheTtlMs ?? 300_000;
  }
}
