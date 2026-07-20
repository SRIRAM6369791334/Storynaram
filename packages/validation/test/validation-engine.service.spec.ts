import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { SchemaCacheService, SchemaCompilerService } from '@storynaram/schemas';
import type { SchemaId, SchemaMeta, SchemaCategory, RegistryStats } from '@storynaram/schemas';
import { ValidationEngineService } from '../src/validation-engine.service';
import { ValidationRunner } from '../src/validation-runner';
import { ValidationPipeline } from '../src/validation-pipeline';
import { ValidationProfileService } from '../src/validation-profile.service';
import { ValidationResultFactory } from '../src/validation-result.factory';
import { ValidationStatisticsService } from '../src/validation-statistics.service';
import { ValidationCache } from '../src/validation-cache';
import { ValidationExecutionError, ValidationProfileError } from '../src/errors';
import { ValidationSeverity } from '../src/validation-severity';

const USER_SCHEMA: Record<string, unknown> = {
  $id: 'test/user',
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    email: { type: 'string', format: 'email' },
  },
  required: ['name'],
  additionalProperties: false,
};

const PRODUCT_SCHEMA: Record<string, unknown> = {
  $id: 'test/product',
  type: 'object',
  properties: {
    id: { type: 'number' },
    title: { type: 'string', minLength: 1 },
    price: { type: 'number', minimum: 0 },
  },
  required: ['id', 'title'],
  additionalProperties: false,
};

const SCHEMA_ID = 'test/user' as SchemaId;
const PRODUCT_ID = 'test/product' as SchemaId;
const UNKNOWN_ID = 'test/unknown' as SchemaId;

class MockRegistry {
  private readonly schemas = new Map<SchemaId, SchemaMeta>();

  register(id: SchemaId, title: string, category: SchemaCategory): void {
    this.schemas.set(id, {
      $id: id,
      title,
      description: `Test schema: ${title}`,
      category,
      filePath: `/test/${id}.json`,
      dependencies: [],
      dependents: [],
      byteSize: 256,
    });
  }

  has(id: SchemaId): boolean {
    return this.schemas.has(id);
  }

  get(id: SchemaId): SchemaMeta | undefined {
    return this.schemas.get(id);
  }

  statistics(): RegistryStats {
    return {
      totalSchemas: this.schemas.size,
      categories: { core: this.schemas.size, domain: 0, ai: 0, workflow: 0, validation: 0 },
      totalCompiled: this.schemas.size,
      cacheHitRate: 0,
      cacheMissRate: 1,
      uptime: 1000,
    };
  }
}

function createEngine(): {
  engine: ValidationEngineService;
  cache: ValidationCache;
  stats: ValidationStatisticsService;
  mockRegistry: MockRegistry;
} {
  const ajv = new Ajv({ strict: true, allErrors: true, validateSchema: false });
  addFormats(ajv);

  const mockRegistry = new MockRegistry();
  mockRegistry.register(SCHEMA_ID, 'User', 'core');
  mockRegistry.register(PRODUCT_ID, 'Product', 'domain');

  const schemaCache = new SchemaCacheService();
  const compiler = new SchemaCompilerService(ajv as never, schemaCache);

  compiler.registerSchema(SCHEMA_ID, USER_SCHEMA);
  compiler.registerSchema(PRODUCT_ID, PRODUCT_SCHEMA);
  compiler.compile(SCHEMA_ID);
  compiler.compile(PRODUCT_ID);

  const profileService = new ValidationProfileService();
  const resultFactory = new ValidationResultFactory();
  const runner = new ValidationRunner(compiler, schemaCache);
  const pipeline = new ValidationPipeline(mockRegistry as never, runner, resultFactory, profileService);
  const cache = new ValidationCache();
  const stats = new ValidationStatisticsService();
  const engine = new ValidationEngineService(
    mockRegistry as never,
    pipeline,
    profileService,
    stats,
    cache,
  );

  return { engine, cache, stats, mockRegistry };
}

describe('ValidationEngineService', () => {
  let engine: ValidationEngineService;
  let cache: ValidationCache;
  let stats: ValidationStatisticsService;

  beforeEach(() => {
    const setup = createEngine();
    engine = setup.engine;
    cache = setup.cache;
    stats = setup.stats;
  });

  describe('validateById', () => {
    it('passes valid data', async () => {
      const result = await engine.validateById(SCHEMA_ID, { name: 'Alice', age: 30 });
      expect(result.passed).toBe(true);
      expect(result.score).toBe(1);
      expect(result.issues).toHaveLength(0);
      expect(result.schemaId).toBe(SCHEMA_ID);
    });

    it('fails invalid data', async () => {
      const result = await engine.validateById(SCHEMA_ID, { name: 123 });
      expect(result.passed).toBe(false);
      expect(result.score).toBeLessThan(1);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('fails when required field is missing', async () => {
      const result = await engine.validateById(SCHEMA_ID, { age: 25 });
      expect(result.passed).toBe(false);
      expect(result.issues.some(i => i.code === 'required')).toBe(true);
    });

    it('fails with additional properties', async () => {
      const result = await engine.validateById(SCHEMA_ID, { name: 'Bob', extra: true });
      expect(result.passed).toBe(false);
    });

    it('throws for unknown schema', async () => {
      await expect(
        engine.validateById(UNKNOWN_ID, {}),
      ).rejects.toThrow('Schema not found');
    });

    it('accepts custom profile', async () => {
      const result = await engine.validateById(SCHEMA_ID, { name: 123 }, { profile: 'fast' });
      expect(result.profileName).toBe('fast');
    });

    it('uses cache on repeated validation', async () => {
      const data = { name: 'Alice' };
      await engine.validateById(SCHEMA_ID, data);
      const statsBefore = cache.getStats();
      await engine.validateById(SCHEMA_ID, data);
      const statsAfter = cache.getStats();
      expect(statsAfter.hits).toBeGreaterThan(statsBefore.hits);
    });
  });

  describe('validate (port interface)', () => {
    it('implements ValidationPort interface', async () => {
      const result = await engine.validate({ name: 'Port' }, SCHEMA_ID);
      expect(result.passed).toBe(true);
      expect(result.score).toBe(1);
    });

    it('returns legacy ValidationResult type', async () => {
      const result = await engine.validate({ name: 'Test' }, SCHEMA_ID);
      expect(result).toHaveProperty('resultId');
      expect(result).toHaveProperty('entityId');
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('validateMany', () => {
    it('validates multiple data items against same schema', async () => {
      const results = await engine.validateMany(
        [{ name: 'A' }, { name: 'B' }],
        SCHEMA_ID,
      );
      expect(results).toHaveLength(2);
      expect(results[0]!.passed).toBe(true);
      expect(results[1]!.passed).toBe(true);
    });

    it('handles mixed valid/invalid items', async () => {
      const results = await engine.validateMany(
        [{ name: 'Valid' }, { wrong: true }],
        SCHEMA_ID,
      );
      expect(results[0]!.passed).toBe(true);
      expect(results[1]!.passed).toBe(false);
    });
  });

  describe('validateOrThrow', () => {
    it('passes valid data', async () => {
      const result = await engine.validateOrThrow(SCHEMA_ID, { name: 'Safe' });
      expect(result.passed).toBe(true);
    });

    it('throws on invalid data', async () => {
      await expect(
        engine.validateOrThrow(SCHEMA_ID, { name: 42 }),
      ).rejects.toThrow(ValidationExecutionError);
    });
  });

  describe('validateManyItems / validateBatch', () => {
    it('validates batch of mixed schema items', async () => {
      const items = [
        { schemaId: SCHEMA_ID, data: { name: 'Alice', age: 30 } },
        { schemaId: PRODUCT_ID, data: { id: 1, title: 'Widget', price: 9.99 } },
      ];
      const batchResult = await engine.validateManyItems(items);
      expect(batchResult.totalCount).toBe(2);
      expect(batchResult.passedCount).toBe(2);
      expect(batchResult.failedCount).toBe(0);
    });

    it('reports failures correctly', async () => {
      const items = [
        { schemaId: SCHEMA_ID, data: { name: 'Alice' } },
        { schemaId: PRODUCT_ID, data: { id: 'not-a-number' as unknown as number } },
      ];
      const batchResult = await engine.validateBatch(items);
      expect(batchResult.passedCount).toBe(1);
      expect(batchResult.failedCount).toBe(1);
    });

    it('computes average score', async () => {
      const items = [
        { schemaId: SCHEMA_ID, data: { name: 'Alice' } },
        { schemaId: SCHEMA_ID, data: { name: 42 } },
      ];
      const batchResult = await engine.validateManyItems(items);
      expect(batchResult.averageScore).toBeGreaterThan(0);
      expect(batchResult.averageScore).toBeLessThan(1);
    });
  });

  describe('supports', () => {
    it('returns true for registered schema', async () => {
      await expect(engine.supports(SCHEMA_ID)).resolves.toBe(true);
    });

    it('returns false for unknown schema', async () => {
      await expect(engine.supports(UNKNOWN_ID)).resolves.toBe(false);
    });
  });

  describe('getStatistics', () => {
    it('returns initial empty metrics', () => {
      const metrics = engine.getStatistics();
      expect(metrics.totalValidations).toBe(0);
      expect(metrics.successfulValidations).toBe(0);
      expect(metrics.failedValidations).toBe(0);
    });

    it('tracks validation counts', async () => {
      await engine.validateById(SCHEMA_ID, { name: 'A' });
      await engine.validateById(SCHEMA_ID, { name: 42 });
      const metrics = engine.getStatistics();
      expect(metrics.totalValidations).toBe(2);
      expect(metrics.successfulValidations).toBe(1);
      expect(metrics.failedValidations).toBe(1);
    });

    it('tracks validations by mode', async () => {
      await engine.validateById(SCHEMA_ID, { name: 'A' }, { profile: 'strict' });
      await engine.validateById(SCHEMA_ID, { name: 'B' }, { profile: 'development' });
      const metrics = engine.getStatistics();
      expect(metrics.validationsByMode['development']).toBe(1);
      expect(metrics.validationsByMode['strict']).toBe(1);
    });

    it('computes average execution time', async () => {
      await engine.validateById(SCHEMA_ID, { name: 'Slow' });
      const metrics = engine.getStatistics();
      expect(metrics.averageExecutionTimeMs).toBeGreaterThanOrEqual(0);
      expect(metrics.totalExecutionTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('health', () => {
    it('returns ok when registry has schemas', () => {
      const status = engine.health();
      expect(status.ok).toBe(true);
      expect(status.details.totalSchemas).toBe(2);
    });

    it('includes validation counts', async () => {
      await engine.validateById(SCHEMA_ID, { name: 'Test' });
      const status = engine.health();
      expect(status.details.totalValidations).toBe(1);
    });
  });
});

describe('ValidationProfileService', () => {
  let service: ValidationProfileService;

  beforeAll(() => {
    service = new ValidationProfileService();
  });

  it('provides built-in profiles', () => {
    expect(service.hasProfile('default')).toBe(true);
    expect(service.hasProfile('strict')).toBe(true);
    expect(service.hasProfile('development')).toBe(true);
    expect(service.hasProfile('production')).toBe(true);
    expect(service.hasProfile('fast')).toBe(true);
    expect(service.hasProfile('deep')).toBe(true);
  });

  it('lists all profile names', () => {
    const names = service.listProfiles();
    expect(names).toContain('default');
    expect(names.length).toBeGreaterThanOrEqual(6);
  });

  it('gets profile config', () => {
    const profile = service.getProfile('strict');
    expect(profile.mode).toBe('strict');
    expect(profile.stopOnFirstError).toBe(true);
  });

  it('registers custom profile', () => {
    service.registerProfile('custom', {
      mode: 'production',
      stopOnFirstError: false,
      includeWarnings: true,
      includeInfo: false,
      verbose: false,
    });
    expect(service.hasProfile('custom')).toBe(true);
    const profile = service.getProfile('custom');
    expect(profile.mode).toBe('production');
  });

  it('throws for unknown profile', () => {
    expect(() => service.getProfile('nonexistent')).toThrow(ValidationProfileError);
  });

  it('prevents removing built-in profiles', () => {
    expect(() => service.removeProfile('default')).toThrow(ValidationProfileError);
  });

  it('removes custom profiles', () => {
    expect(service.removeProfile('custom')).toBe(true);
    expect(service.hasProfile('custom')).toBe(false);
  });
});

describe('ValidationCache', () => {
  let cache: ValidationCache;

  beforeEach(() => {
    cache = new ValidationCache(10);
  });

  it('stores and retrieves results', () => {
    const result = {
      resultId: 'r1',
      schemaId: 'test/s1' as SchemaId,
      passed: true,
      score: 1,
      issues: [],
      executionTimeMs: 5,
      mode: 'production' as const,
      profileName: 'default',
      timestamp: new Date(),
    };
    cache.set('key1', result);
    expect(cache.get('key1')).toBe(result);
  });

  it('returns undefined for missing key', () => {
    expect(cache.get('missing')).toBeUndefined();
  });

  it('tracks hits and misses', () => {
    cache.get('miss');
    const stats1 = cache.getStats();
    expect(stats1.misses).toBe(1);

    const result = {
      resultId: 'r1',
      schemaId: 'test/s1' as SchemaId,
      passed: true,
      score: 1,
      issues: [],
      executionTimeMs: 5,
      mode: 'production' as const,
      profileName: 'default',
      timestamp: new Date(),
    };
    cache.set('k', result);
    cache.get('k');
    const stats2 = cache.getStats();
    expect(stats2.hits).toBe(1);
    expect(stats2.misses).toBe(1);
  });

  it('evicts oldest entry when full', () => {
    const small = new ValidationCache(3);
    for (let i = 0; i < 5; i++) {
      small.set(`k${i}`, {
        resultId: 'r1',
        schemaId: 'test/s1' as SchemaId,
        passed: true,
        score: 1,
        issues: [],
        executionTimeMs: 1,
        mode: 'production' as const,
        profileName: 'default',
        timestamp: new Date(),
      });
    }
    const evicted = small.get('k0');
    expect(evicted).toBeUndefined();
  });

  it('clears all entries', () => {
    cache.set('a', {
      resultId: 'r1',
      schemaId: 'test/s1' as SchemaId,
      passed: true,
      score: 1,
      issues: [],
      executionTimeMs: 0,
      mode: 'production' as const,
      profileName: 'default',
      timestamp: new Date(),
    });
    cache.clear();
    expect(cache.has('a')).toBe(false);
    const stats = cache.getStats();
    expect(stats.size).toBe(0);
  });
});

describe('ValidationResultFactory', () => {
  const factory = new ValidationResultFactory();
  const context = {
    schemaId: 'test/ctx' as SchemaId,
    data: {},
    profileName: 'default',
    profile: {
      mode: 'production' as const,
      stopOnFirstError: false,
      includeWarnings: true,
      includeInfo: true,
      verbose: false,
    },
  };

  it('creates success result with score 1', () => {
    const result = factory.createSuccess(context);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(1);
    expect(result.issues).toHaveLength(0);
  });

  it('creates success with metadata', () => {
    const meta = {
      $id: 'test/ctx' as SchemaId,
      title: 'Test',
      category: 'core' as SchemaCategory,
      filePath: '/test.json',
      dependencies: [],
      dependents: [],
      byteSize: 100,
    };
    const result = factory.createSuccess(context, meta, 10, { source: 'test' });
    expect(result.schemaTitle).toBe('Test');
    expect(result.executionTimeMs).toBe(10);
    expect(result.metadata).toEqual({ source: 'test' });
  });

  it('creates failure result with issues', () => {
    const errors = [
      { instancePath: '/name', message: 'is required', keyword: 'required' },
      { instancePath: '/age', message: 'must be number', keyword: 'type' },
    ];
    const result = factory.createFailure(context, errors);
    expect(result.passed).toBe(false);
    expect(result.issues).toHaveLength(2);
    expect(result.issues[0]!.path).toBe('/name');
    expect(result.issues[0]!.code).toBe('required');
    expect(result.issues[0]!.severity).toBe(ValidationSeverity.ERROR);
  });

  it('filters warnings when profile excludes them', () => {
    const strictContext = { ...context, profile: { ...context.profile, includeWarnings: false } };
    const errors = [
      { instancePath: '/x', message: 'warning', keyword: 'warning' },
      { instancePath: '/y', message: 'error', keyword: 'type' },
    ];
    const result = factory.createFailure(strictContext, errors);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]!.path).toBe('/y');
  });

  it('limits errors based on maxErrors', () => {
    const limitedContext = {
      ...context,
      profile: { ...context.profile, maxErrors: 2 },
    };
    const errors = Array.from({ length: 10 }, (_, i) => ({
      instancePath: `/p${i}`,
      message: `error ${i}`,
      keyword: 'type',
    }));
    const result = factory.createFailure(limitedContext, errors);
    expect(result.issues.length).toBeLessThanOrEqual(2);
  });

  it('calculates score correctly', () => {
    const errors = [
      { instancePath: '/a', message: 'error', keyword: 'type' },
      { instancePath: '/b', message: 'error', keyword: 'type' },
    ];
    const result = factory.createFailure(context, errors);
    expect(result.score).toBeCloseTo(0.6, 5);
  });

  it('score never goes below 0', () => {
    const errors = Array.from({ length: 10 }, (_, i) => ({
      instancePath: `/p${i}`,
      message: 'error',
      keyword: 'type',
    }));
    const result = factory.createFailure(context, errors);
    expect(result.score).toBe(0);
  });
});

describe('ValidationStatisticsService', () => {
  let stats: ValidationStatisticsService;

  beforeEach(() => {
    stats = new ValidationStatisticsService();
  });

  it('starts empty', () => {
    const metrics = stats.getMetrics();
    expect(metrics.totalValidations).toBe(0);
    expect(metrics.throughputPerSecond).toBe(0);
  });

  it('records successful validation', () => {
    stats.record('test/s1', 'production', true, 10);
    const metrics = stats.getMetrics();
    expect(metrics.totalValidations).toBe(1);
    expect(metrics.successfulValidations).toBe(1);
    expect(metrics.failedValidations).toBe(0);
    expect(metrics.totalExecutionTimeMs).toBe(10);
  });

  it('records failed validation', () => {
    stats.record('test/s1', 'strict', false, 5);
    const metrics = stats.getMetrics();
    expect(metrics.successfulValidations).toBe(0);
    expect(metrics.failedValidations).toBe(1);
  });

  it('tracks by mode', () => {
    stats.record('s1', 'strict', true, 1);
    stats.record('s1', 'fast', false, 1);
    const metrics = stats.getMetrics();
    expect(metrics.validationsByMode['strict']).toBe(1);
    expect(metrics.validationsByMode['fast']).toBe(1);
  });

  it('tracks by schema', () => {
    stats.record('s1', 'default', true, 1);
    stats.record('s1', 'default', true, 1);
    stats.record('s2', 'default', false, 1);
    const metrics = stats.getMetrics();
    expect(metrics.validationsBySchema['s1']).toBe(2);
    expect(metrics.validationsBySchema['s2']).toBe(1);
  });

  it('computes average and throughput', () => {
    stats.record('s1', 'default', true, 100);
    stats.record('s1', 'default', false, 100);
    const metrics = stats.getMetrics();
    expect(metrics.averageExecutionTimeMs).toBe(100);
    expect(metrics.throughputPerSecond).toBe(10);
  });

  it('resets all metrics', () => {
    stats.record('s1', 'default', true, 10);
    stats.reset();
    const metrics = stats.getMetrics();
    expect(metrics.totalValidations).toBe(0);
  });
});

describe('ValidationRunner', () => {
  it('validates correctly using real compiler + cache', () => {
    const ajv = new Ajv({ strict: true, allErrors: true, validateSchema: false });
    const schemaCache = new SchemaCacheService();
    const compiler = new SchemaCompilerService(ajv as never, schemaCache);
    const runner = new ValidationRunner(compiler, schemaCache);

    compiler.registerSchema('test/runner' as SchemaId, {
      type: 'object',
      properties: { x: { type: 'number' } },
      required: ['x'],
    });

    const validResult = runner.run('test/runner' as SchemaId, { x: 42 });
    expect(validResult.valid).toBe(true);

    const invalidResult = runner.run('test/runner' as SchemaId, { x: 'str' });
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors).toBeDefined();
    expect(invalidResult.errors!.length).toBeGreaterThan(0);
  });
});
