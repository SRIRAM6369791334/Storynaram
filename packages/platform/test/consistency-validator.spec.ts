import { describe, it, expect } from 'vitest';
import { ConsistencyValidator } from '../src/cross-domain/consistency-validator';
import { IntegrationRegistry } from '../src/integration-registry';

describe('ConsistencyValidator', () => {
  it('validates with no checks', async () => {
    const registry = new IntegrationRegistry();
    const validator = new ConsistencyValidator(registry);
    const results = await validator.validate();
    expect(results).toHaveLength(0);
  });

  it('runs all checks', async () => {
    const registry = new IntegrationRegistry();
    const validator = new ConsistencyValidator(registry);
    validator.addCheck(async () => ({
      checkName: 'character-names',
      description: 'All characters have names',
      domains: ['character'],
      passed: true,
      details: ['OK'],
    }));
    validator.addCheck(async () => ({
      checkName: 'world-map',
      description: 'World has map',
      domains: ['world'],
      passed: false,
      details: ['Missing map'],
    }));
    const results = await validator.validate();
    expect(results).toHaveLength(2);
    expect(results[0]!.passed).toBe(true);
    expect(results[1]!.passed).toBe(false);
  });

  it('checks if consistent', async () => {
    const registry = new IntegrationRegistry();
    const validator = new ConsistencyValidator(registry);
    validator.addCheck(async () => ({
      checkName: 'ok', description: '', domains: ['character'], passed: true, details: [],
    }));
    expect(await validator.isConsistent()).toBe(true);
    validator.addCheck(async () => ({
      checkName: 'fail', description: '', domains: ['world'], passed: false, details: [],
    }));
    expect(await validator.isConsistent()).toBe(false);
  });

  it('validates with filter', async () => {
    const registry = new IntegrationRegistry();
    const validator = new ConsistencyValidator(registry);
    validator.addCheck(async () => ({
      checkName: 'char', description: '', domains: ['character'], passed: true, details: [],
    }));
    validator.addCheck(async () => ({
      checkName: 'world', description: '', domains: ['world'], passed: false, details: [],
    }));
    const filtered = await validator.validateWithFilter(['character']);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]!.checkName).toBe('char');
  });

  it('returns check count', () => {
    const registry = new IntegrationRegistry();
    const validator = new ConsistencyValidator(registry);
    expect(validator.getCheckCount()).toBe(0);
    validator.addCheck(async () => ({
      checkName: 'x', description: '', domains: [], passed: true, details: [],
    }));
    expect(validator.getCheckCount()).toBe(1);
  });
});
