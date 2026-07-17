export class CoreConfig {
  readonly entityCacheSize: number;
  readonly enableSoftDelete: boolean;

  constructor(data?: Partial<CoreConfig>) {
    this.entityCacheSize = data?.entityCacheSize ?? 1000;
    this.enableSoftDelete = data?.enableSoftDelete ?? true;
  }
}
