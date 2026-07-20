import { describe, it, expect, beforeEach } from 'vitest';
import { AIPromptBuilder, AIPromptTemplateManager } from '../src/ai';
import { AIValidationError } from '../src/ai';

describe('AIPromptBuilder', () => {
  let builder: AIPromptBuilder;

  beforeEach(() => {
    builder = AIPromptBuilder.create();
  });

  it('should build a simple user message', () => {
    const messages = builder.addUser('Hello').build();
    expect(messages.length).toBe(1);
    expect(messages[0]?.role).toBe('user');
    expect(messages[0]?.content).toBe('Hello');
  });

  it('should include system prompt', () => {
    const messages = builder.addSystem('Be helpful').addUser('Hi').build();
    expect(messages.length).toBe(2);
    expect(messages[0]?.role).toBe('system');
    expect(messages[0]?.content).toBe('Be helpful');
    expect(messages[1]?.role).toBe('user');
  });

  it('should include developer prompt', () => {
    const messages = builder.setDeveloperPrompt('Dev context').addUser('Hi').build();
    expect(messages.length).toBe(2);
    expect(messages[0]?.role).toBe('developer');
  });

  it('should mix system and developer prompts', () => {
    const messages = builder.addSystem('System msg').setDeveloperPrompt('Dev msg').addUser('Hi').build();
    expect(messages.length).toBe(3);
    expect(messages[0]?.role).toBe('system');
    expect(messages[1]?.role).toBe('developer');
    expect(messages[2]?.role).toBe('user');
  });

  it('should add assistant messages', () => {
    const messages = builder.addUser('Q').addAssistant('A').build();
    expect(messages.length).toBe(2);
    expect(messages[1]?.role).toBe('assistant');
  });

  it('should add tool messages', () => {
    const messages = builder.addUser('Use tool').addAssistant('Calling', [{ id: 'call1', type: 'function', function: { name: 'test', arguments: '{}' } }]).addToolResult('call1', 'Result').build();
    expect(messages.length).toBe(3);
    expect(messages[2]?.role).toBe('tool');
    expect(messages[2]?.toolCallId).toBe('call1');
  });

  it('should add multiple messages', () => {
    builder.addMessages([{ role: 'user', content: 'A' }, { role: 'assistant', content: 'B' }]);
    const messages = builder.build();
    expect(messages.length).toBe(2);
  });

  it('should reset', () => {
    builder.addUser('Hello').reset();
    const messages = builder.build();
    expect(messages.length).toBe(0);
  });

  it('should render template with variables', () => {
    const rendered = builder.renderTemplate(
      { id: 't1', version: '1.0', name: 'test', template: 'Hello {{name}}, you are {{age}} years old', variables: ['name', 'age'] },
      { name: 'Alice', age: '30' },
    );
    expect(rendered).toBe('Hello Alice, you are 30 years old');
  });

  it('should throw on missing template variables', () => {
    expect(() => builder.renderTemplate(
      { id: 't1', version: '1.0', name: 'test', template: 'Hello {{name}}', variables: ['name', 'age'] },
      { name: 'Alice' },
    )).toThrow(AIValidationError);
  });

  it('should build from options with template', () => {
    const messages = builder.buildWithOptions({
      systemPrompt: 'System',
      template: { id: 't1', version: '1.0', name: 'test', template: 'Hello {{name}}', variables: ['name'], systemPrompt: 'Template system' },
      variables: { name: 'Alice' },
    });
    expect(messages.length).toBe(2);
    expect(messages[0]?.role).toBe('system');
    expect(messages[0]?.content).toBe('Template system');
    expect(messages[1]?.role).toBe('user');
    expect(messages[1]?.content).toBe('Hello Alice');
  });

  it('should throw on empty messages', () => {
    expect(() => builder.addUser('').build()).toThrow(AIValidationError);
  });

  it('should accept assistant messages without content when toolCalls exist', () => {
    builder.addAssistant('', [{ id: 'c1', type: 'function', function: { name: 't', arguments: '{}' } }]);
    expect(() => builder.build()).not.toThrow();
  });
});

describe('AIPromptTemplateManager', () => {
  let manager: AIPromptTemplateManager;

  beforeEach(() => {
    manager = new AIPromptTemplateManager();
  });

  it('should register and get a template', () => {
    manager.register({ id: 't1', version: '1.0', name: 'test', template: 'Hello', variables: [] });
    const template = manager.get('t1');
    expect(template?.id).toBe('t1');
    expect(template?.version).toBe('1.0');
  });

  it('should get template by name', () => {
    manager.register({ id: 't1', version: '1.0', name: 'test', template: 'Hello', variables: [] });
    const template = manager.getByName('test');
    expect(template?.id).toBe('t1');
  });

  it('should get specific version', () => {
    manager.register({ id: 't1', version: '1.0', name: 'test', template: 'v1', variables: [] });
    manager.register({ id: 't1', version: '2.0', name: 'test', template: 'v2', variables: [] });
    const v1 = manager.get('t1', '1.0');
    const v2 = manager.get('t1', '2.0');
    expect(v1?.template).toBe('v1');
    expect(v2?.template).toBe('v2');
  });

  it('should return latest version when no version specified', () => {
    manager.register({ id: 't1', version: '1.0', name: 'test', template: 'v1', variables: [] });
    manager.register({ id: 't1', version: '2.0', name: 'test', template: 'v2', variables: [] });
    const latest = manager.get('t1');
    expect(latest?.version).toBe('2.0');
  });

  it('should list all templates', () => {
    manager.register({ id: 't1', version: '1.0', name: 'test', template: 'Hello', variables: [] });
    manager.register({ id: 't2', version: '1.0', name: 'test2', template: 'World', variables: [] });
    expect(manager.list().length).toBe(2);
  });

  it('should list versions of a template', () => {
    manager.register({ id: 't1', version: '1.0', name: 'test', template: 'v1', variables: [] });
    manager.register({ id: 't1', version: '2.0', name: 'test', template: 'v2', variables: [] });
    expect(manager.listVersions('t1').length).toBe(2);
  });

  it('should unregister specific version', () => {
    manager.register({ id: 't1', version: '1.0', name: 'test', template: 'v1', variables: [] });
    manager.register({ id: 't1', version: '2.0', name: 'test', template: 'v2', variables: [] });
    manager.unregister('t1', '1.0');
    expect(manager.get('t1', '1.0')).toBeUndefined();
    expect(manager.get('t1', '2.0')).toBeDefined();
  });

  it('should unregister all versions', () => {
    manager.register({ id: 't1', version: '1.0', name: 'test', template: 'v1', variables: [] });
    manager.register({ id: 't1', version: '2.0', name: 'test', template: 'v2', variables: [] });
    manager.unregister('t1');
    expect(manager.list().length).toBe(0);
  });

  it('should validate a valid template', () => {
    expect(() => manager.validate({ id: 't1', version: '1.0', name: 'test', template: 'Hello {{name}}', variables: ['name'] })).not.toThrow();
  });

  it('should throw on invalid template', () => {
    expect(() => manager.validate({ id: '', version: '', name: '', template: '', variables: [] })).toThrow(AIValidationError);
  });

  it('should throw on variable mismatch', () => {
    expect(() => manager.validate({ id: 't1', version: '1.0', name: 'test', template: 'Hello {{name}}', variables: [] })).toThrow(AIValidationError);
  });
});
