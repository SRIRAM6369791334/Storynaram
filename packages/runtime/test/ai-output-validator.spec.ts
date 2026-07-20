import { describe, it, expect, beforeEach } from 'vitest';
import { AIOutputValidator } from '../src/ai';

describe('AIOutputValidator', () => {
  let validator: AIOutputValidator;

  beforeEach(() => {
    validator = new AIOutputValidator();
  });

  it('should pass validation when no schema options provided', async () => {
    const result = await validator.validate({
      id: '1', model: 'test', provider: 'mock', messages: [{ role: 'assistant', content: '{"key":"value"}' }],
      tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, finishReason: 'stop', latencyMs: 0,
    });
    expect(result.valid).toBe(true);
    expect(result.issues.length).toBe(0);
  });

  it('should validate JSON content against schema', async () => {
    const result = await validator.validate({
      id: '1', model: 'test', provider: 'mock', messages: [{ role: 'assistant', content: '{"name":"Alice","age":30}' }],
      tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, finishReason: 'stop', latencyMs: 0,
    }, {
      schema: { required: ['name', 'age'] },
    });
    expect(result.valid).toBe(true);
  });

  it('should detect missing required fields', async () => {
    const result = await validator.validate({
      id: '1', model: 'test', provider: 'mock', messages: [{ role: 'assistant', content: '{"name":"Alice"}' }],
      tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, finishReason: 'stop', latencyMs: 0,
    }, {
      schema: { required: ['name', 'age'] },
    });
    expect(result.valid).toBe(false);
    expect(result.issues[0]).toContain('age');
  });

  it('should fail on invalid JSON content', async () => {
    const result = await validator.validate({
      id: '1', model: 'test', provider: 'mock', messages: [{ role: 'assistant', content: 'not-json' }],
      tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, finishReason: 'stop', latencyMs: 0,
    }, {
      schema: { required: ['name'] },
    });
    expect(result.valid).toBe(false);
  });

  it('should fail when no content', async () => {
    const result = await validator.validate({
      id: '1', model: 'test', provider: 'mock', messages: [{ role: 'assistant', content: '' }],
      tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, finishReason: 'stop', latencyMs: 0,
    }, {
      schema: { required: ['name'] },
    });
    expect(result.valid).toBe(false);
  });

  it('should validate with retry', async () => {
    const result = await validator.validateWithRetry({
      id: '1', model: 'test', provider: 'mock', messages: [{ role: 'assistant', content: '{"name":"Alice"}' }],
      tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, finishReason: 'stop', latencyMs: 0,
    }, {
      schema: { required: ['name', 'age'] },
    }, 3);
    expect(result.valid).toBe(false);
    expect(result.attempts).toBe(1);
  });
});
