import { InjectionToken } from '@nestjs/common';
import type { RedisModuleOptions as ModuleOptions } from './types';

export const REDIS_MODULE_OPTIONS: InjectionToken = Symbol('REDIS_MODULE_OPTIONS');
export const REDIS_CONNECTION_OPTIONS: InjectionToken = Symbol('REDIS_CONNECTION_OPTIONS');
export const REDIS_CLIENT: InjectionToken = Symbol('REDIS_CLIENT');
export const REDIS_CONNECTION: InjectionToken = Symbol('REDIS_CONNECTION');
export const REDIS_CACHE_PROVIDER: InjectionToken = Symbol('REDIS_CACHE_PROVIDER');
export const REDIS_DISTRIBUTED_LOCK_MANAGER: InjectionToken = Symbol('REDIS_DISTRIBUTED_LOCK_MANAGER');
export const REDIS_PUBSUB_MANAGER: InjectionToken = Symbol('REDIS_PUBSUB_MANAGER');
export const REDIS_STREAM_MANAGER: InjectionToken = Symbol('REDIS_STREAM_MANAGER');
export const REDIS_QUEUE_MANAGER: InjectionToken = Symbol('REDIS_QUEUE_MANAGER');
export const REDIS_SESSION_STORE: InjectionToken = Symbol('REDIS_SESSION_STORE');
export const REDIS_RATE_LIMITER: InjectionToken = Symbol('REDIS_RATE_LIMITER');
export const REDIS_HEALTH_INDICATOR: InjectionToken = Symbol('REDIS_HEALTH_INDICATOR');
export const REDIS_METRICS_COLLECTOR: InjectionToken = Symbol('REDIS_METRICS_COLLECTOR');
export const REDIS_STATISTICS_SERVICE: InjectionToken = Symbol('REDIS_STATISTICS_SERVICE');
export const REDIS_WORKFLOW_CACHE: InjectionToken = Symbol('REDIS_WORKFLOW_CACHE');
export const REDIS_AI_CACHE: InjectionToken = Symbol('REDIS_AI_CACHE');
export const REDIS_PLUGIN_CACHE: InjectionToken = Symbol('REDIS_PLUGIN_CACHE');

export function getCacheToken(namespace: string): InjectionToken {
  return Symbol.for(`REDIS_CACHE_${namespace}`);
}

export type RedisModuleOptions = ModuleOptions;

export type RedisModuleAsyncOptions = {
  useFactory: (...args: unknown[]) => RedisModuleOptions | Promise<RedisModuleOptions>;
  inject?: InjectionToken[];
  imports?: any[];
};
