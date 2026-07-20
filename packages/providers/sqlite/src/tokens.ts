import { InjectionToken } from '@nestjs/common';
import type { SQLiteModuleOptions as ModuleOptions } from './types';

export const SQLITE_MODULE_OPTIONS: InjectionToken = Symbol('SQLITE_MODULE_OPTIONS');
export const SQLITE_CONNECTION_OPTIONS: InjectionToken = Symbol('SQLITE_CONNECTION_OPTIONS');
export const SQLITE_DATABASE: InjectionToken = Symbol('SQLITE_DATABASE');
export const SQLITE_CONNECTION: InjectionToken = Symbol('SQLITE_CONNECTION');
export const SQLITE_TRANSACTION_MANAGER: InjectionToken = Symbol('SQLITE_TRANSACTION_MANAGER');
export const SQLITE_MIGRATION_RUNNER: InjectionToken = Symbol('SQLITE_MIGRATION_RUNNER');
export const SQLITE_SCHEMA_MANAGER: InjectionToken = Symbol('SQLITE_SCHEMA_MANAGER');
export const SQLITE_REPOSITORY_ADAPTER: InjectionToken = Symbol('SQLITE_REPOSITORY_ADAPTER');
export const SQLITE_HEALTH_INDICATOR: InjectionToken = Symbol('SQLITE_HEALTH_INDICATOR');
export const SQLITE_METRICS_COLLECTOR: InjectionToken = Symbol('SQLITE_METRICS_COLLECTOR');
export const SQLITE_STATISTICS_SERVICE: InjectionToken = Symbol('SQLITE_STATISTICS_SERVICE');

export function getRepositoryAdapterToken(entityType: string): InjectionToken {
  return Symbol.for(`SQLITE_REPOSITORY_ADAPTER_${entityType}`);
}

export type SQLiteModuleOptions = ModuleOptions;

export type SQLiteModuleAsyncOptions = {
  useFactory: (...args: unknown[]) => SQLiteModuleOptions | Promise<SQLiteModuleOptions>;
  inject?: InjectionToken[];
  imports?: any[];
};
