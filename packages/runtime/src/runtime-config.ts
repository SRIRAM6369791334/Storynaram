import { Injectable } from '@nestjs/common';

@Injectable()
export class RuntimeConfig {
  readonly enableCaching: boolean;
  readonly cacheMaxSize: number;
  readonly enableValidation: boolean;
  readonly enableEvents: boolean;
  readonly enableSoftDelete: boolean;
  readonly entityCacheTtlMs: number;

  constructor(data?: Partial<RuntimeConfig>) {
    this.enableCaching = data?.enableCaching ?? true;
    this.cacheMaxSize = data?.cacheMaxSize ?? 500;
    this.enableValidation = data?.enableValidation ?? true;
    this.enableEvents = data?.enableEvents ?? true;
    this.enableSoftDelete = data?.enableSoftDelete ?? true;
    this.entityCacheTtlMs = data?.entityCacheTtlMs ?? 300000;
  }
}
