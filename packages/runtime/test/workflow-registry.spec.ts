import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowRegistry, WorkflowBuilder } from '../src/workflow';

describe('WorkflowRegistry', () => {
  let registry: WorkflowRegistry;

  beforeEach(() => {
    registry = new WorkflowRegistry();
  });

  it('should register and resolve workflow definitions', () => {
    const def = WorkflowBuilder.create('test-flow').addStep('s1', 'Custom').withConfig({}).end().build();
    registry.register(def);

    const resolved = registry.resolve('test-flow', '1.0.0');
    expect(resolved.name).toBe('test-flow');
  });

  it('should resolve latest version when no version specified', () => {
    const v1 = WorkflowBuilder.create('multi-version').withVersion('1.0.0').addStep('s1', 'Custom').withConfig({}).end().build();
    const v2 = WorkflowBuilder.create('multi-version').withVersion('2.0.0').addStep('s1', 'Custom').withConfig({}).end().build();
    registry.register(v1);
    registry.register(v2);

    const resolved = registry.resolve('multi-version');
    expect(resolved.version).toBe('2.0.0');
  });

  it('should throw when workflow not found', () => {
    expect(() => registry.resolve('nonexistent')).toThrow('No workflow found with name: nonexistent');
  });

  it('should check existence', () => {
    const def = WorkflowBuilder.create('exists-test').addStep('s1', 'Custom').withConfig({}).end().build();
    expect(registry.has('exists-test')).toBe(false);
    registry.register(def);
    expect(registry.has('exists-test')).toBe(true);
  });

  it('should unregister workflows', () => {
    const def = WorkflowBuilder.create('to-remove').addStep('s1', 'Custom').withConfig({}).end().build();
    registry.register(def);
    expect(registry.unregister('to-remove', '1.0.0')).toBe(true);
    expect(registry.has('to-remove')).toBe(false);
  });

  it('should list registered names', () => {
    registry.register(WorkflowBuilder.create('flow-a').addStep('s1', 'Custom').withConfig({}).end().build());
    registry.register(WorkflowBuilder.create('flow-b').addStep('s1', 'Custom').withConfig({}).end().build());

    const names = registry.listNames();
    expect(names).toContain('flow-a');
    expect(names).toContain('flow-b');
  });

  it('should list versions for a workflow', () => {
    registry.register(WorkflowBuilder.create('ver-flow').withVersion('1.0.0').addStep('s1', 'Custom').withConfig({}).end().build());
    registry.register(WorkflowBuilder.create('ver-flow').withVersion('2.0.0').addStep('s1', 'Custom').withConfig({}).end().build());
    registry.register(WorkflowBuilder.create('ver-flow').withVersion('3.0.0').addStep('s1', 'Custom').withConfig({}).end().build());

    const versions = registry.listVersions('ver-flow');
    expect(versions).toHaveLength(3);
    expect(versions).toContain('1.0.0');
    expect(versions).toContain('2.0.0');
    expect(versions).toContain('3.0.0');
  });

  it('should list all definitions', () => {
    registry.register(WorkflowBuilder.create('list-a').addStep('s1', 'Custom').withConfig({}).end().build());
    registry.register(WorkflowBuilder.create('list-b').addStep('s1', 'Custom').withConfig({}).end().build());

    expect(registry.listAll()).toHaveLength(2);
  });

  it('should count definitions', () => {
    expect(registry.count()).toBe(0);
    registry.register(WorkflowBuilder.create('count-a').addStep('s1', 'Custom').withConfig({}).end().build());
    expect(registry.count()).toBe(1);
  });

  it('should clear all definitions', () => {
    registry.register(WorkflowBuilder.create('clear-a').addStep('s1', 'Custom').withConfig({}).end().build());
    registry.register(WorkflowBuilder.create('clear-b').addStep('s1', 'Custom').withConfig({}).end().build());
    registry.clear();
    expect(registry.count()).toBe(0);
  });

  it('should warn on duplicate registration', () => {
    const def = WorkflowBuilder.create('dup-flow').addStep('s1', 'Custom').withConfig({}).end().build();
    registry.register(def);
    registry.register(def); // should not throw, just warn
    expect(registry.count()).toBe(1);
  });
});
