import type { InjectionToken } from '@nestjs/common';
import type { StorageModuleOptions } from './types.js';

export const STORAGE_MODULE_OPTIONS: InjectionToken = Symbol('STORAGE_MODULE_OPTIONS');

export const STORAGE_CLIENT: InjectionToken = Symbol('STORAGE_CLIENT');

export const STORAGE_REGISTRY: InjectionToken = Symbol('STORAGE_REGISTRY');

export const STORAGE_BUCKET_MANAGER: InjectionToken = Symbol('STORAGE_BUCKET_MANAGER');

export const STORAGE_OBJECT_MANAGER: InjectionToken = Symbol('STORAGE_OBJECT_MANAGER');

export const STORAGE_MULTIPART_UPLOAD_MANAGER: InjectionToken = Symbol('STORAGE_MULTIPART_UPLOAD_MANAGER');

export const STORAGE_SIGNED_URL_SERVICE: InjectionToken = Symbol('STORAGE_SIGNED_URL_SERVICE');

export const STORAGE_METADATA_SERVICE: InjectionToken = Symbol('STORAGE_METADATA_SERVICE');

export const STORAGE_LIFECYCLE_MANAGER: InjectionToken = Symbol('STORAGE_LIFECYCLE_MANAGER');

export const STORAGE_REPLICATION_MANAGER: InjectionToken = Symbol('STORAGE_REPLICATION_MANAGER');

export const STORAGE_VERSION_MANAGER: InjectionToken = Symbol('STORAGE_VERSION_MANAGER');

export const STORAGE_HEALTH_INDICATOR: InjectionToken = Symbol('STORAGE_HEALTH_INDICATOR');

export const STORAGE_METRICS_COLLECTOR: InjectionToken = Symbol('STORAGE_METRICS_COLLECTOR');

export const STORAGE_STATISTICS_SERVICE: InjectionToken = Symbol('STORAGE_STATISTICS_SERVICE');

export function getStorageClientToken(providerName: string): InjectionToken {
  return Symbol.for(`STORAGE_CLIENT_${providerName}`);
}

export function getStorageProviderConfigToken(providerName: string): InjectionToken {
  return Symbol.for(`STORAGE_PROVIDER_CONFIG_${providerName}`);
}

export type StorageModuleAsyncOptions = {
  useFactory: (...args: unknown[]) => StorageModuleOptions | Promise<StorageModuleOptions>;
  inject?: InjectionToken[];
  imports?: any[];
};
