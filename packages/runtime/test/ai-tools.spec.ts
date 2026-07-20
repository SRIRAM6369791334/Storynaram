import { describe, it, expect, beforeEach } from 'vitest';
import { AIToolRegistry, AIToolExecutor } from '../src/ai';
import { AIToolError } from '../src/ai';
import type { AITool, AIToolResult } from '../src/ai';

describe('AIToolRegistry', () => {
  let registry: AIToolRegistry;

  beforeEach(() => {
    registry = new AIToolRegistry();
  });

  it('should register and resolve a tool', () => {
    const tool: AITool = { name: 'test', description: 'Test tool', parameters: {}, execute: async () => 'result' };
    registry.register(tool);
    expect(registry.resolve('test').name).toBe('test');
  });

  it('should throw on unknown tool', () => {
    expect(() => registry.resolve('unknown')).toThrow(AIToolError);
  });

  it('should register multiple tools', () => {
    const tools: AITool[] = [
      { name: 'a', description: 'A', parameters: {}, execute: async () => 'a' },
      { name: 'b', description: 'B', parameters: {}, execute: async () => 'b' },
    ];
    registry.registerMany(tools);
    expect(registry.size).toBe(2);
  });

  it('should unregister a tool', () => {
    const tool: AITool = { name: 'test', description: 'Test', parameters: {}, execute: async () => 'result' };
    registry.register(tool);
    registry.unregister('test');
    expect(registry.has('test')).toBe(false);
  });

  it('should list all tools', () => {
    registry.register({ name: 'a', description: 'A', parameters: {}, execute: async () => 'a' });
    registry.register({ name: 'b', description: 'B', parameters: {}, execute: async () => 'b' });
    expect(registry.list().length).toBe(2);
  });

  it('should generate tool definitions', () => {
    registry.register({ name: 'my_tool', description: 'My tool', parameters: { type: 'object', properties: { x: { type: 'string' } } }, execute: async () => 'result' });
    const defs = registry.listDefinitions();
    expect(defs.length).toBe(1);
    expect(defs[0]?.function.name).toBe('my_tool');
    expect(defs[0]?.function.description).toBe('My tool');
  });

  it('should clear all tools', () => {
    registry.register({ name: 'a', description: 'A', parameters: {}, execute: async () => 'a' });
    registry.clear();
    expect(registry.size).toBe(0);
  });
});

describe('AIToolExecutor', () => {
  let registry: AIToolRegistry;
  let executor: AIToolExecutor;

  beforeEach(() => {
    registry = new AIToolRegistry();
    executor = new AIToolExecutor(registry);
  });

  it('should execute a tool successfully', async () => {
    registry.register({ name: 'greet', description: 'Greet', parameters: {}, execute: async (args) => `Hello ${args.name as string}` });
    const result = await executor.executeTool('greet', { name: 'World' });
    expect(result.success).toBe(true);
    expect(result.output).toBe('Hello World');
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should return error for unknown tool', async () => {
    const result = await executor.executeTool('unknown', {});
    expect(result.success).toBe(false);
    expect(result.error).toContain('unknown');
  });

  it('should execute tool call from AIToolCall', async () => {
    registry.register({ name: 'add', description: 'Add', parameters: {}, execute: async (args) => (args.a as number) + (args.b as number) });
    const result = await executor.executeToolCall({ id: 'c1', type: 'function', function: { name: 'add', arguments: '{"a":1,"b":2}' } });
    expect(result.success).toBe(true);
    expect(result.output).toBe(3);
  });

  it('should handle invalid JSON arguments', async () => {
    const result = await executor.executeToolCall({ id: 'c1', type: 'function', function: { name: 'test', arguments: 'invalid-json' } });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid tool arguments');
  });

  it('should execute multiple tool calls in parallel', async () => {
    registry.register({ name: 'a', description: 'A', parameters: {}, execute: async () => 'result-a' });
    registry.register({ name: 'b', description: 'B', parameters: {}, execute: async () => 'result-b' });
    const results = await executor.executeToolCalls([
      { id: 'c1', type: 'function', function: { name: 'a', arguments: '{}' } },
      { id: 'c2', type: 'function', function: { name: 'b', arguments: '{}' } },
    ]);
    expect(results.length).toBe(2);
    expect(results[0]?.success).toBe(true);
    expect(results[1]?.success).toBe(true);
  });

  it('should enforce tool timeout', async () => {
    registry.register({
      name: 'slow', description: 'Slow', parameters: {},
      execute: async () => { await new Promise(resolve => setTimeout(resolve, 500)); return 'done'; },
    });
    const result = await executor.executeToolWithTimeout('slow', {}, 50);
    expect(result.success).toBe(false);
    expect(result.error).toContain('timed out');
  });

  it('should retry tool execution on failure', async () => {
    let attempts = 0;
    registry.register({
      name: 'flakey', description: 'Flakey', parameters: {},
      execute: async () => { attempts++; if (attempts < 2) throw new Error('Fail'); return 'success'; },
    });
    const result = await executor.executeToolWithRetry('flakey', {}, 3);
    expect(result.success).toBe(true);
    expect(result.output).toBe('success');
  });

  it('should fail after retries exhausted', async () => {
    registry.register({
      name: 'always-fail', description: 'Always fails', parameters: {},
      execute: async () => { throw new Error('Always fail'); },
    });
    const result = await executor.executeToolWithRetry('always-fail', {}, 2);
    expect(result.success).toBe(false);
  });
});
