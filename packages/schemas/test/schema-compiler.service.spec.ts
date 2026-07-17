import { describe, it, expect, beforeEach } from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { SchemaCompilerService } from '../src/schema-compiler.service';
import { SchemaCacheService } from '../src/schema-cache.service';

function createCompiler(): SchemaCompilerService {
  const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false });
  addFormats(ajv);
  const cache = new SchemaCacheService(100);
  const compiler = new SchemaCompilerService(ajv as any, cache);
  return compiler;
}

describe('SchemaCompilerService', () => {
  let compiler: SchemaCompilerService;

  beforeEach(() => {
    compiler = createCompiler();
  });

  it('should compile a simple schema', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    };

    compiler.registerSchema('https://example.com/Simple' as any, schema);

    const result = compiler.compile('https://example.com/Simple' as any);
    expect(result.success).toBe(true);
    expect(result.schemaId).toBe('https://example.com/Simple' as any);
    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(result.errors).toBeUndefined();
  });

  it('should validate data against compiled schema', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'integer', minimum: 0 },
      },
      required: ['name', 'age'],
    };

    compiler.registerSchema('https://example.com/Person' as any, schema);

    const validResult = compiler.validate('https://example.com/Person' as any, { name: 'Alice', age: 30 });
    expect(validResult.valid).toBe(true);
    expect(validResult.errors).toBeUndefined();

    const invalidResult = compiler.validate('https://example.com/Person' as any, { name: 'Alice' });
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors).toBeDefined();
    expect(invalidResult.errors!.length).toBeGreaterThan(0);
  });

  it('should cache compiled validators', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { x: { type: 'number' } },
    };

    compiler.registerSchema('https://example.com/Cached' as any, schema);

    const result1 = compiler.compile('https://example.com/Cached' as any);
    expect(result1.success).toBe(true);

    const result2 = compiler.compile('https://example.com/Cached' as any);
    expect(result2.success).toBe(true);
    expect(result2.duration).toBeLessThanOrEqual(result1.duration);
  });

  it('should handle compilation errors gracefully', () => {
    const invalidSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        bad: { type: 'nonexistent_type' },
      },
    };

    compiler.registerSchema('https://example.com/BadSchema' as any, invalidSchema);

    const result = compiler.compile('https://example.com/BadSchema' as any);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('should handle compilation of unregistered schema', () => {
    const result = compiler.compile('https://example.com/NotRegistered' as any);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Schema https://example.com/NotRegistered not registered');
  });

  it('should register and remove schemas', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { a: { type: 'string' } },
    };

    compiler.registerSchema('https://example.com/Removable' as any, schema);
    expect(compiler.isSchemaRegistered('https://example.com/Removable' as any)).toBe(true);

    compiler.removeSchema('https://example.com/Removable' as any);
    expect(compiler.isSchemaRegistered('https://example.com/Removable' as any)).toBe(false);
  });

  it('should register multiple schemas at once', () => {
    const schemas = [
      { schemaId: 'https://example.com/S1' as any, schema: { type: 'object', properties: { a: { type: 'string' } } } },
      { schemaId: 'https://example.com/S2' as any, schema: { type: 'object', properties: { b: { type: 'number' } } } },
    ];

    compiler.registerSchemas(schemas);

    expect(compiler.isSchemaRegistered('https://example.com/S1' as any)).toBe(true);
    expect(compiler.isSchemaRegistered('https://example.com/S2' as any)).toBe(true);
  });

  it('should compile all schemas', () => {
    const schemas = [
      { schemaId: 'https://example.com/S1' as any, schema: { type: 'object', properties: { a: { type: 'string' } } } },
      { schemaId: 'https://example.com/S2' as any, schema: { type: 'object', properties: { b: { type: 'number' } } } },
    ];

    compiler.registerSchemas(schemas);

    const results = compiler.compileAll(['https://example.com/S1' as any, 'https://example.com/S2' as any]);
    expect(results).toHaveLength(2);
    expect(results.every(r => r.success)).toBe(true);
  });

  it('should handle validation of unregistered schema', () => {
    const result = compiler.validate('https://example.com/NotExist' as any, {});
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should validate with complex nested schemas', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
        },
      },
      required: ['items'],
    };

    compiler.registerSchema('https://example.com/Complex' as any, schema);

    expect(compiler.validate('https://example.com/Complex' as any, { items: ['a', 'b'] }).valid).toBe(true);
    expect(compiler.validate('https://example.com/Complex' as any, { items: [] }).valid).toBe(false);
    expect(compiler.validate('https://example.com/Complex' as any, {}).valid).toBe(false);
  });

  it('should handle validation with enum schemas', () => {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
      },
      required: ['status'],
    };

    compiler.registerSchema('https://example.com/Enum' as any, schema);

    expect(compiler.validate('https://example.com/Enum' as any, { status: 'active' }).valid).toBe(true);
    expect(compiler.validate('https://example.com/Enum' as any, { status: 'unknown' }).valid).toBe(false);
  });

  it('should clear compiled schemas', () => {
    const schema = { type: 'object', properties: { x: { type: 'string' } } };
    compiler.registerSchema('https://example.com/ClearTest' as any, schema);
    compiler.compile('https://example.com/ClearTest' as any);

    compiler.clear();

    const result = compiler.compile('https://example.com/ClearTest' as any, schema);
    expect(result.success).toBe(true);
  });

  it('should validate using newly compiled schema if not cached', () => {
    const schema = {
      type: 'object',
      properties: { value: { type: 'number' } },
      required: ['value'],
    };

    compiler.registerSchema('https://example.com/AutoCompile' as any, schema);

    const result = compiler.validate('https://example.com/AutoCompile' as any, { value: 42 });
    expect(result.valid).toBe(true);
  });
});
