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
import { bench, describe } from 'vitest';

const SCHEMAS: { id: string; schema: Record<string, unknown> }[] = [
  {
    id: 'bench/user',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 100 },
        email: { type: 'string', format: 'email' },
        age: { type: 'integer', minimum: 0, maximum: 150 },
        roles: {
          type: 'array',
          items: { type: 'string', enum: ['admin', 'user', 'viewer'] },
        },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
            zip: { type: 'string', pattern: '^\\d{5}$' },
          },
          required: ['street', 'city'],
        },
      },
      required: ['id', 'name', 'email'],
      additionalProperties: false,
    },
  },
  {
    id: 'bench/product',
    schema: {
      type: 'object',
      properties: {
        sku: { type: 'string', pattern: '^[A-Z]{3}-\\d{4}$' },
        title: { type: 'string', minLength: 1 },
        price: { type: 'number', minimum: 0 },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['sku', 'title', 'price'],
      additionalProperties: false,
    },
  },
  {
    id: 'bench/config',
    schema: {
      type: 'object',
      properties: {
        debug: { type: 'boolean' },
        port: { type: 'integer', minimum: 1, maximum: 65535 },
        host: { type: 'string', format: 'hostname' },
        retries: { type: 'integer', minimum: 0, maximum: 10 },
      },
      required: ['port', 'host'],
      additionalProperties: false,
    },
  },
];

const VALID_DATA: Record<string, unknown>[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 30,
    roles: ['admin', 'user'],
    address: { street: '123 Main St', city: 'Springfield', zip: '12345' },
  },
  {
    sku: 'ABC-1234',
    title: 'Wireless Mouse',
    price: 29.99,
    tags: ['electronics', 'input'],
  },
  {
    debug: false,
    port: 8080,
    host: 'localhost',
    retries: 3,
  },
];

const INVALID_DATA: Record<string, unknown>[] = [
  {
    id: 'not-a-number',
    name: '',
    email: 'bad-email',
    age: 999,
    roles: ['superadmin'],
    address: { street: 'Main' },
  },
  {
    sku: 'invalid',
    title: '',
    price: -5,
  },
  {
    debug: 'yes',
    port: 0,
    host: '',
  },
];

function createEngine(): ValidationEngineService {
  const ajv = new Ajv({ strict: true, allErrors: true, validateSchema: false });
  addFormats(ajv);

  const mockRegistry = {
    schemas: new Map<string, SchemaMeta>(),
    has(id: string): boolean { return this.schemas.has(id); },
    get(id: string): SchemaMeta | undefined { return this.schemas.get(id); },
    statistics(): RegistryStats {
      return {
        totalSchemas: this.schemas.size,
        categories: { core: 0, domain: 0, ai: 0, workflow: 0, validation: 0 },
        totalCompiled: this.schemas.size,
        cacheHitRate: 0,
        cacheMissRate: 1,
        uptime: 60000,
      };
    },
  };

  const schemaCache = new SchemaCacheService();
  const compiler = new SchemaCompilerService(ajv as never, schemaCache);

  for (const { id, schema } of SCHEMAS) {
    const schemaId = id as SchemaId;
    mockRegistry.schemas.set(id, {
      $id: schemaId,
      title: id,
      category: 'core' as SchemaCategory,
      filePath: `/bench/${id}.json`,
      dependencies: [],
      dependents: [],
      byteSize: 512,
    });
    compiler.registerSchema(schemaId, schema);
    compiler.compile(schemaId);
  }

  const profileService = new ValidationProfileService();
  const resultFactory = new ValidationResultFactory();
  const runner = new ValidationRunner(compiler, schemaCache);
  const pipeline = new ValidationPipeline(mockRegistry as never, runner, resultFactory, profileService);
  const cache = new ValidationCache();
  const stats = new ValidationStatisticsService();

  return new ValidationEngineService(mockRegistry as never, pipeline, profileService, stats, cache);
}

const engine = createEngine();

describe('Validation Engine Benchmarks', () => {
  bench('validate 1 valid object', async () => {
    await engine.validateById('bench/user' as SchemaId, VALID_DATA[0]!);
  });

  bench('validate 1 invalid object', async () => {
    await engine.validateById('bench/user' as SchemaId, INVALID_DATA[0]!);
  });

  bench('validate 3 mixed schemas (valid)', async () => {
    for (let i = 0; i < 3; i++) {
      await engine.validateById(SCHEMAS[i]!.id as SchemaId, VALID_DATA[i]!);
    }
  });

  bench('validate 3 mixed schemas (invalid)', async () => {
    for (let i = 0; i < 3; i++) {
      await engine.validateById(SCHEMAS[i]!.id as SchemaId, INVALID_DATA[i]!);
    }
  });

  bench('batch validate 10 items', async () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      schemaId: SCHEMAS[i % 3]!.id as SchemaId,
      data: i % 2 === 0 ? VALID_DATA[i % 3]! : INVALID_DATA[i % 3]!,
    }));
    await engine.validateBatch(items);
  });

  bench('validateOrThrow (valid)', async () => {
    await engine.validateOrThrow('bench/user' as SchemaId, VALID_DATA[0]!);
  });

  bench('health check', () => {
    engine.health();
  });
});
