import { describe, it, expect } from 'vitest';
import { CrossDomainValidator } from '../src/cross-domain/cross-domain-validator';
import { IntegrationRegistry } from '../src/integration-registry';

describe('CrossDomainValidator', () => {
  it('validates with no rules', async () => {
    const registry = new IntegrationRegistry();
    const validator = new CrossDomainValidator(registry);
    const issues = await validator.validateAll();
    expect(issues).toHaveLength(0);
  });

  it('validates all rules', async () => {
    const registry = new IntegrationRegistry();
    const validator = new CrossDomainValidator(registry);
    validator.addRule({
      name: 'check-1',
      domain: 'character',
      validate: async () => [{
        domain: 'character', entityId: '1', entityType: 'hero',
        issue: 'Missing name', severity: 'error',
      }],
    });
    validator.addRule({
      name: 'check-2',
      domain: 'world',
      validate: async () => [{
        domain: 'world', entityId: '2', entityType: 'location',
        issue: 'No map', severity: 'warning',
      }],
    });
    const issues = await validator.validateAll();
    expect(issues).toHaveLength(2);
  });

  it('adds multiple rules at once', () => {
    const registry = new IntegrationRegistry();
    const validator = new CrossDomainValidator(registry);
    validator.addRules([
      { name: 'r1', domain: 'character', validate: async () => [] },
      { name: 'r2', domain: 'world', validate: async () => [] },
    ]);
    expect(validator.getRuleCount()).toBe(2);
  });

  it('validates for a specific domain', async () => {
    const registry = new IntegrationRegistry();
    const validator = new CrossDomainValidator(registry);
    validator.addRules([
      {
        name: 'r1', domain: 'character',
        validate: async () => [{ domain: 'character', entityId: '1', entityType: 'h', issue: 'err', severity: 'error' }],
      },
      {
        name: 'r2', domain: 'world',
        validate: async () => [{ domain: 'world', entityId: '2', entityType: 'w', issue: 'warn', severity: 'warning' }],
      },
    ]);
    const charIssues = await validator.validateForDomain('character');
    expect(charIssues).toHaveLength(1);
    expect(charIssues[0]!.domain).toBe('character');
  });

  it('validates for multiple domains', async () => {
    const registry = new IntegrationRegistry();
    const validator = new CrossDomainValidator(registry);
    validator.addRules([
      {
        name: 'r1', domain: 'character',
        validate: async () => [{ domain: 'character', entityId: '1', entityType: 'h', issue: 'err', severity: 'error' }],
      },
      {
        name: 'r2', domain: 'world',
        validate: async () => [{ domain: 'world', entityId: '2', entityType: 'w', issue: 'warn', severity: 'warning' }],
      },
      {
        name: 'r3', domain: 'canon',
        validate: async () => [{ domain: 'canon', entityId: '3', entityType: 'c', issue: 'info', severity: 'info' }],
      },
    ]);
    const issues = await validator.validateForDomains(['character', 'world']);
    expect(issues).toHaveLength(2);
  });

  it('returns rules as readonly', () => {
    const registry = new IntegrationRegistry();
    const validator = new CrossDomainValidator(registry);
    validator.addRule({
      name: 'test', domain: 'character', validate: async () => [],
    });
    expect(validator.getRules()).toHaveLength(1);
  });
});
