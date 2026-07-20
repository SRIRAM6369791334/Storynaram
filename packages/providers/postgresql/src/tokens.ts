import { InjectionToken } from '@nestjs/common';
import type { PostgreSQLConnectionOptions, PostgreSQLModuleOptions } from './types';

export const POSTGRESQL_MODULE_OPTIONS: InjectionToken = Symbol('POSTGRESQL_MODULE_OPTIONS');
export const POSTGRESQL_CONNECTION_OPTIONS: InjectionToken = Symbol('POSTGRESQL_CONNECTION_OPTIONS');
export const POSTGRESQL_POOL: InjectionToken = Symbol('POSTGRESQL_POOL');
export const POSTGRESQL_CONNECTION: InjectionToken = Symbol('POSTGRESQL_CONNECTION');
export const POSTGRESQL_TRANSACTION_MANAGER: InjectionToken = Symbol('POSTGRESQL_TRANSACTION_MANAGER');
export const POSTGRESQL_MIGRATION_RUNNER: InjectionToken = Symbol('POSTGRESQL_MIGRATION_RUNNER');
export const POSTGRESQL_SCHEMA_MANAGER: InjectionToken = Symbol('POSTGRESQL_SCHEMA_MANAGER');
export const POSTGRESQL_REPOSITORY_ADAPTER: InjectionToken = Symbol('POSTGRESQL_REPOSITORY_ADAPTER');
export const POSTGRESQL_HEALTH_INDICATOR: InjectionToken = Symbol('POSTGRESQL_HEALTH_INDICATOR');
export const POSTGRESQL_METRICS_COLLECTOR: InjectionToken = Symbol('POSTGRESQL_METRICS_COLLECTOR');
export const POSTGRESQL_STATISTICS_SERVICE: InjectionToken = Symbol('POSTGRESQL_STATISTICS_SERVICE');

export function getRepositoryAdapterToken(entityType: string): InjectionToken {
  return Symbol.for(`POSTGRESQL_REPOSITORY_ADAPTER_${entityType}`);
}

export interface PostgresModuleOptions {
  connection: PostgreSQLConnectionOptions;
  migrations?: {
    migrationsTable?: string;
    enableSeed?: boolean;
  };
  healthCheckIntervalMs?: number;
  slowQueryThresholdMs?: number;
  enableMetrics?: boolean;
}

export type PostgresModuleAsyncOptions = {
  useFactory: (...args: unknown[]) => PostgresModuleOptions | Promise<PostgresModuleOptions>;
  inject?: InjectionToken[];
  imports?: any[];
};
