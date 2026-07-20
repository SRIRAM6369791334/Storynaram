import { describe, it, expect, beforeEach } from 'vitest';
import { PluginHookRegistry } from '../src/plugin';

describe('PluginHookRegistry', () => {
  let registry: PluginHookRegistry;

  beforeEach(() => {
    registry = new PluginHookRegistry();
  });

  it('should register and list hooks', () => {
    registry.register('plugin-a', 'test:hook', () => 'result');
    expect(registry.hasHooks('test:hook')).toBe(true);
    expect(registry.listHookNames()).toEqual(['test:hook']);
  });

  it('should execute before hooks in priority order', async () => {
    const order: number[] = [];

    registry.register('plugin-a', 'test:before', () => { order.push(1); }, { priority: 10 });
    registry.register('plugin-b', 'test:before', () => { order.push(2); }, { priority: 5 });
    registry.register('plugin-c', 'test:before', () => { order.push(3); }, { priority: 0 });

    await registry.executeBefore('test:before');
    expect(order).toEqual([3, 2, 1]);
  });

  it('should execute after hooks', async () => {
    const afterResults: string[] = [];

    registry.register('plugin-a', 'test:after', (ctx) => {
      afterResults.push(`got:${ctx.result}`);
    }, { type: 'after' });

    await registry.executeAfter('test:after', 'hello');
    expect(afterResults).toEqual(['got:hello']);
  });

  it('should support stopPropagation in before hooks', async () => {
    const executed: string[] = [];

    registry.register('plugin-a', 'test:stop', (ctx) => {
      executed.push('a');
      ctx.stopPropagation();
    }, { priority: 0 });

    registry.register('plugin-b', 'test:stop', () => {
      executed.push('b');
    }, { priority: 10 });

    await registry.executeBefore('test:stop');
    expect(executed).toEqual(['a']);
  });

  it('should execute around hooks as middleware pipeline', async () => {
    const steps: string[] = [];

    registry.register('plugin-a', 'test:around', (ctx) => {
      steps.push('before-a');
      const result = ctx.proceed();
      steps.push('after-a');
      return result;
    }, { type: 'around', priority: 0 });

    registry.register('plugin-b', 'test:around', (ctx) => {
      steps.push('before-b');
      const result = ctx.proceed();
      steps.push('after-b');
      return result;
    }, { type: 'around', priority: 10 });

    const result = await registry.executeAround('test:around', async () => {
      steps.push('core');
      return 'done';
    });

    expect(steps).toEqual(['before-a', 'before-b', 'core', 'after-b', 'after-a']);
    expect(result).toBe('done');
  });

  it('should execute hooks in parallel', async () => {
    const executed: string[] = [];

    registry.register('plugin-a', 'test:parallel', () => {
      executed.push('a');
    });
    registry.register('plugin-b', 'test:parallel', () => {
      executed.push('b');
    });

    await registry.executeParallel('test:parallel');
    expect(executed).toContain('a');
    expect(executed).toContain('b');
  });

  it('should unregister specific hook', () => {
    registry.register('plugin-a', 'hook:1', () => 'a');
    registry.register('plugin-b', 'hook:1', () => 'b');
    expect(registry.size).toBe(2);

    registry.unregister('plugin-a', 'hook:1');
    expect(registry.size).toBe(1);
    expect(registry.getHooks('hook:1')[0]?.pluginId).toBe('plugin-b');
  });

  it('should unregister all hooks for a plugin', () => {
    registry.register('plugin-a', 'hook:1', () => 'a');
    registry.register('plugin-a', 'hook:2', () => 'b');
    registry.register('plugin-b', 'hook:1', () => 'c');
    expect(registry.size).toBe(3);

    registry.unregisterAll('plugin-a');
    expect(registry.size).toBe(1);
  });

  it('should count hooks per plugin', () => {
    registry.register('plugin-a', 'hook:1', () => 'a');
    registry.register('plugin-a', 'hook:2', () => 'b');
    registry.register('plugin-b', 'hook:1', () => 'c');
    expect(registry.countHooksForPlugin('plugin-a')).toBe(2);
    expect(registry.countHooksForPlugin('plugin-b')).toBe(1);
    expect(registry.countHooksForPlugin('plugin-c')).toBe(0);
  });

  it('should clear all hooks', () => {
    registry.register('plugin-a', 'hook:1', () => 'a');
    registry.clear();
    expect(registry.size).toBe(0);
    expect(registry.listHookNames()).toEqual([]);
  });

  it('should return empty array when no hooks exist', () => {
    expect(registry.getHooks('nonexistent')).toEqual([]);
    expect(registry.hasHooks('nonexistent')).toBe(false);
  });
});
