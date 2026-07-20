import { describe, it, expect } from 'vitest';
import { PluginLifecycle } from '../src/plugin';

describe('PluginLifecycle', () => {
  const lifecycle = new PluginLifecycle();

  it('should allow valid transitions', () => {
    expect(lifecycle.canTransition('discovered', 'loaded')).toBe(true);
    expect(lifecycle.canTransition('discovered', 'destroyed')).toBe(true);
    expect(lifecycle.canTransition('loaded', 'initialized')).toBe(true);
    expect(lifecycle.canTransition('initialized', 'started')).toBe(true);
    expect(lifecycle.canTransition('started', 'stopped')).toBe(true);
    expect(lifecycle.canTransition('started', 'reloaded')).toBe(true);
    expect(lifecycle.canTransition('stopped', 'started')).toBe(true);
    expect(lifecycle.canTransition('stopped', 'unloaded')).toBe(true);
    expect(lifecycle.canTransition('disabled', 'started')).toBe(true);
    expect(lifecycle.canTransition('unloaded', 'loaded')).toBe(true);
  });

  it('should reject invalid transitions', () => {
    expect(lifecycle.canTransition('discovered', 'started')).toBe(false);
    expect(lifecycle.canTransition('loaded', 'started')).toBe(false);
    expect(lifecycle.canTransition('started', 'loaded')).toBe(false);
    expect(lifecycle.canTransition('destroyed', 'started')).toBe(false);
    expect(lifecycle.canTransition('initialized', 'destroyed')).toBe(true);
  });

  it('should assert valid transitions', () => {
    expect(() => lifecycle.assertCanTransition('discovered', 'loaded')).not.toThrow();
  });

  it('should throw on invalid transitions', () => {
    expect(() => lifecycle.assertCanTransition('discovered', 'started')).toThrow();
    expect(() => lifecycle.assertCanTransition('loaded', 'destroyed')).not.toThrow();
  });

  it('should transition descriptor and update timestamps', () => {
    const descriptor = {
      manifest: { id: 'test', name: 'Test', version: '1.0.0' },
      status: 'discovered' as const,
      errorCount: 0,
      hooks: 0,
      metadata: {},
    };

    const loaded = lifecycle.transition(descriptor, 'loaded');
    expect(loaded.status).toBe('loaded');
    expect(loaded.startedAt).toBeUndefined();

    const initialized = lifecycle.transition(loaded, 'initialized');
    expect(initialized.status).toBe('initialized');

    const started = lifecycle.transition(initialized, 'started');
    expect(started.status).toBe('started');
    expect(started.startedAt).toBeDefined();
    expect(started.startedAt instanceof Date).toBe(true);
    expect(started.stoppedAt).toBeUndefined();

    const stopped = lifecycle.transition(started, 'stopped');
    expect(stopped.status).toBe('stopped');
    expect(stopped.stoppedAt).toBeDefined();
  });

  it('should record errors', () => {
    const descriptor = {
      manifest: { id: 'test', name: 'Test', version: '1.0.0' },
      status: 'started' as const,
      errorCount: 0,
      hooks: 0,
      metadata: {},
    };

    const errored = lifecycle.recordError(descriptor, 'Something went wrong');
    expect(errored.errorCount).toBe(1);
    expect(errored.lastError).toBe('Something went wrong');

    const erroredAgain = lifecycle.recordError(errored, 'Another error');
    expect(erroredAgain.errorCount).toBe(2);
    expect(erroredAgain.lastError).toBe('Another error');
  });

  it('should check active/stopped/terminal states', () => {
    expect(lifecycle.isActive('started')).toBe(true);
    expect(lifecycle.isActive('stopped')).toBe(false);

    expect(lifecycle.isStopped('stopped')).toBe(true);
    expect(lifecycle.isStopped('disabled')).toBe(true);
    expect(lifecycle.isStopped('started')).toBe(false);

    expect(lifecycle.isTerminal('destroyed')).toBe(true);
    expect(lifecycle.isTerminal('started')).toBe(false);

    expect(lifecycle.canBeLoaded('discovered')).toBe(true);
    expect(lifecycle.canBeLoaded('loaded')).toBe(false);

    expect(lifecycle.canBeStarted('initialized')).toBe(true);
    expect(lifecycle.canBeStarted('started')).toBe(false);
  });
});
