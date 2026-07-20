import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowBuilder, WorkflowEngine, WorkflowExecutor, WorkflowStateMachine, WorkflowStepExecutor, WorkflowInstanceManager, WorkflowContext, WorkflowHistoryService, WorkflowCheckpointService, WorkflowMetricsService, WorkflowRegistry, WorkflowScheduler } from '../src/workflow';

function createEngine(): WorkflowEngine {
  const stateMachine = new WorkflowStateMachine();
  const scheduler = new WorkflowScheduler();
  const instanceManager = new WorkflowInstanceManager();
  const context = new WorkflowContext();
  const history = new WorkflowHistoryService();
  const checkpoint = new WorkflowCheckpointService(history, context, { enabled: true });
  const stepExecutor = new WorkflowStepExecutor();
  const executor = new WorkflowExecutor(stateMachine, stepExecutor, instanceManager, context, history, checkpoint, scheduler);
  const registry = new WorkflowRegistry();
  const metrics = new WorkflowMetricsService();
  return new WorkflowEngine(registry, executor, instanceManager, context, history, checkpoint, metrics, stateMachine, scheduler);
}

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;

  beforeEach(() => {
    engine = createEngine();
  });

  it('should define and register a workflow', () => {
    const def = engine.define('test-workflow')
      .addStep('step1', 'Custom')
      .withConfig({})
      .end()
      .build();

    engine.register(def);
    expect(engine.registry.has('test-workflow')).toBe(true);
  });

  it('should start a workflow instance', async () => {
    const def = engine.define('start-test')
      .addStep('step1', 'Custom')
      .withConfig({})
      .end()
      .build();

    engine.register(def);
    const instance = await engine.start(def, { input: 'data' });

    expect(instance.workflowName).toBe('start-test');
    expect(instance.status).toBe('Running');
    expect(instance.context).toEqual({ input: 'data' });
  });

  it('should start workflow by name', async () => {
    const def = engine.define('by-name')
      .addStep('step1', 'Custom')
      .withConfig({})
      .end()
      .build();

    engine.register(def);
    const instance = await engine.startByName('by-name', { key: 'value' });

    expect(instance).toBeDefined();
    expect(instance.workflowName).toBe('by-name');
  });

  it('should list registered workflows', () => {
    const def1 = engine.define('flow-a').addStep('s1', 'Custom').withConfig({}).end().build();
    const def2 = engine.define('flow-b').addStep('s1', 'Custom').withConfig({}).end().build();
    engine.register(def1);
    engine.register(def2);

    const names = engine.listWorkflows();
    expect(names).toContain('flow-a');
    expect(names).toContain('flow-b');
  });

  it('should track active instances', async () => {
    const def = engine.define('active-test')
      .addStep('step1', 'Delay')
      .withConfig({ delayMs: 50 })
      .end()
      .build();

    engine.register(def);
    const instance = await engine.start(def);

    expect(engine.instanceManager.get(instance.id)).toBeDefined();
    expect(engine.instanceManager.count()).toBe(1);
  });

  it('should get workflow result', async () => {
    const def = engine.define('result-test')
      .addStep('step1', 'Custom')
      .withConfig({})
      .end()
      .build();

    engine.register(def);
    const instance = await engine.start(def);
    const result = await engine.getResult(instance.id);

    expect(result).toBeDefined();
    expect(result!.workflowName).toBe('result-test');
  });
});

describe('WorkflowInstanceManager', () => {
  let manager: WorkflowInstanceManager;

  beforeEach(() => {
    manager = new WorkflowInstanceManager();
  });

  it('should create instance', () => {
    const instance = manager.create('test', '1.0.0', { key: 'val' });
    expect(instance.workflowName).toBe('test');
    expect(instance.version).toBe('1.0.0');
    expect(instance.status).toBe('Created');
    expect(instance.context.key).toBe('val');
  });

  it('should update status', () => {
    const instance = manager.create('test', '1.0.0');
    manager.updateStatus(instance.id, 'Running');
    expect(manager.get(instance.id)?.status).toBe('Running');
    expect(manager.get(instance.id)?.startedAt).toBeDefined();
  });

  it('should set error', () => {
    const instance = manager.create('test', '1.0.0');
    manager.setError(instance.id, 'Something went wrong');
    expect(manager.get(instance.id)?.error).toBe('Something went wrong');
  });

  it('should filter by status', () => {
    const a = manager.create('test', '1.0.0');
    const b = manager.create('test', '1.0.0');
    manager.updateStatus(a.id, 'Running');
    manager.updateStatus(b.id, 'Completed');

    const active = manager.getActive();
    const running = manager.getByStatus('Running');

    expect(active.length).toBe(1);
    expect(running.length).toBe(1);
    expect(running[0]!.id).toBe(a.id);
  });

  it('should add history entries', () => {
    const instance = manager.create('test', '1.0.0');
    const entry = manager.createHistoryEntry(instance.id, 'step1', 'WorkflowStepStarted', 'Running');
    manager.addHistory(instance.id, entry);

    expect(manager.get(instance.id)!.history.length).toBe(1);
    expect(manager.get(instance.id)!.history[0]!.stepId).toBe('step1');
  });

  it('should delete instance', () => {
    const instance = manager.create('test', '1.0.0');
    expect(manager.delete(instance.id)).toBe(true);
    expect(manager.get(instance.id)).toBeUndefined();
  });

  it('should clear all instances', () => {
    manager.create('a', '1.0.0');
    manager.create('b', '1.0.0');
    manager.clear();
    expect(manager.count()).toBe(0);
  });
});
