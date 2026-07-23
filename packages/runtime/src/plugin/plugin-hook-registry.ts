import { Injectable, Logger } from '@nestjs/common';
import type { PluginId, PluginHook, PluginHookHandler, PluginHookContext, HookType } from './types.js';
import { PluginError } from './errors.js';

@Injectable()
export class PluginHookRegistry {
  private readonly logger = new Logger(PluginHookRegistry.name);
  private readonly hooks: Map<string, PluginHook[]> = new Map();

  register(pluginId: PluginId, hookName: string, handler: PluginHookHandler, options?: { priority?: number; type?: HookType; async?: boolean }): void {
    const hook: PluginHook = {
      pluginId,
      hookName,
      type: options?.type ?? 'before',
      handler,
      priority: options?.priority ?? 0,
      async: options?.async ?? true,
    };

    const existing = this.hooks.get(hookName) ?? [];
    existing.push(hook);
    existing.sort((a, b) => a.priority - b.priority);
    this.hooks.set(hookName, existing);

    this.logger.log(`Plugin "${pluginId}" registered hook: ${hookName} (${hook.type}, priority ${hook.priority})`);
  }

  unregister(pluginId: PluginId, hookName: string): void {
    const existing = this.hooks.get(hookName);
    if (!existing) return;

    const filtered = existing.filter(h => h.pluginId !== pluginId);
    if (filtered.length === 0) {
      this.hooks.delete(hookName);
    } else {
      this.hooks.set(hookName, filtered);
    }

    this.logger.log(`Plugin "${pluginId}" unregistered hook: ${hookName}`);
  }

  unregisterAll(pluginId: PluginId): void {
    for (const [hookName, hooks] of this.hooks.entries()) {
      const filtered = hooks.filter(h => h.pluginId !== pluginId);
      if (filtered.length === 0) {
        this.hooks.delete(hookName);
      } else {
        this.hooks.set(hookName, filtered);
      }
    }
    this.logger.log(`Unregistered all hooks for plugin: ${pluginId}`);
  }

  getHooks(hookName: string): PluginHook[] {
    return [...(this.hooks.get(hookName) ?? [])];
  }

  getHooksByType(hookName: string, type: HookType): PluginHook[] {
    return this.getHooks(hookName).filter(h => h.type === type);
  }

  hasHooks(hookName: string): boolean {
    return (this.hooks.get(hookName)?.length ?? 0) > 0;
  }

  async executeBefore(hookName: string, ...args: unknown[]): Promise<void> {
    const hooks = this.getHooksByType(hookName, 'before');
    if (hooks.length === 0) return;

    let stopped = false;

    for (const hook of hooks) {
      if (stopped) break;

      const context: PluginHookContext = {
        pluginId: hook.pluginId,
        hookName,
        proceed: () => { stopped = false; },
        stopPropagation: () => { stopped = true; },
      };

      try {
        if (hook.async) {
          await hook.handler(context, ...args);
        } else {
          hook.handler(context, ...args);
        }
      } catch (error) {
        this.logger.error(`Hook "${hookName}" (before) from plugin "${hook.pluginId}" failed: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }
  }

  async executeAfter(hookName: string, result: unknown, ...args: unknown[]): Promise<void> {
    const hooks = this.getHooksByType(hookName, 'after');
    if (hooks.length === 0) return;

    let stopped = false;
    let currentResult = result;

    for (const hook of hooks) {
      if (stopped) break;

      const context: PluginHookContext = {
        pluginId: hook.pluginId,
        hookName,
        proceed: () => { stopped = false; },
        stopPropagation: () => { stopped = true; },
        result: currentResult,
      };

      try {
        if (hook.async) {
          currentResult = await hook.handler(context, ...args);
        } else {
          currentResult = hook.handler(context, ...args);
        }
      } catch (error) {
        this.logger.error(`Hook "${hookName}" (after) from plugin "${hook.pluginId}" failed: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }
  }

  async executeAround<T>(hookName: string, fn: () => Promise<T>, ...args: unknown[]): Promise<T> {
    const hooks = this.getHooksByType(hookName, 'around');
    if (hooks.length === 0) {
      return fn();
    }

    let pipeline: () => Promise<T> = fn;

    for (const hook of hooks.reverse()) {
      const next = pipeline;
      pipeline = async () => {
        const context: PluginHookContext = {
          pluginId: hook.pluginId,
          hookName,
          proceed: () => next(),
          stopPropagation: () => { throw new PluginError('Hook chain stopped', 'HOOK_STOPPED'); },
        };

        const result = await (hook.async
          ? hook.handler(context, ...args)
          : hook.handler(context, ...args));

        return result as T;
      };
    }

    return pipeline();
  }

  async executeParallel(hookName: string, ...args: unknown[]): Promise<void> {
    const hooks = this.getHooks(hookName);
    if (hooks.length === 0) return;

    const promises = hooks.map(async (hook) => {
      const context: PluginHookContext = {
        pluginId: hook.pluginId,
        hookName,
        proceed: () => {},
        stopPropagation: () => {},
      };

      try {
        if (hook.async) {
          await hook.handler(context, ...args);
        } else {
          hook.handler(context, ...args);
        }
      } catch (error) {
        this.logger.error(`Parallel hook "${hookName}" from plugin "${hook.pluginId}" failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    await Promise.all(promises);
  }

  listHookNames(): string[] {
    return Array.from(this.hooks.keys());
  }

  countHooksForPlugin(pluginId: PluginId): number {
    let count = 0;
    for (const hooks of this.hooks.values()) {
      count += hooks.filter(h => h.pluginId === pluginId).length;
    }
    return count;
  }

  clear(): void {
    this.hooks.clear();
  }

  get size(): number {
    let count = 0;
    for (const hooks of this.hooks.values()) {
      count += hooks.length;
    }
    return count;
  }
}
