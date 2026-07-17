import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { SchemaCacheService } from '../src/schema-cache.service';
import { SchemaCompilerService } from '../src/schema-compiler.service';

const SCHEMAS_ROOT = resolve(import.meta.dirname, '../../../schemas');

interface SchemaFile {
  filePath: string;
  raw: Record<string, unknown>;
}

let allSchemas: SchemaFile[] = [];

function isRunningInCI(): boolean {
  return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
}

function loadAllSchemas(): SchemaFile[] {
  const results: SchemaFile[] = [];
  const categories = ['core', 'domain', 'ai', 'workflow', 'validation'];

  for (const category of categories) {
    const dir = join(SCHEMAS_ROOT, category);
    try {
      const files = readdirSync(dir).filter(f => f.endsWith('.schema.json'));
      for (const file of files) {
        const filePath = join(dir, file);
        try {
          const content = readFileSync(filePath, 'utf-8');
          results.push({ filePath, raw: JSON.parse(content) as Record<string, unknown> });
        } catch {
          // skip unreadable files
        }
      }
    } catch {
      // skip missing categories
    }
  }

  return results;
}

describe('Benchmarks', () => {
  beforeAll(() => {
    allSchemas = loadAllSchemas();
  });

  it('should load all schemas from disk', () => {
    if (isRunningInCI()) {
      return;
    }

    const start = Date.now();
    const schemas = loadAllSchemas();
    const duration = Date.now() - start;

    expect(schemas.length).toBeGreaterThan(0);
    console.log(`[BENCHMARK] Loaded ${schemas.length} schemas in ${duration}ms`);
  });

  it('should benchmark compiling schemas', () => {
    if (isRunningInCI()) {
      return;
    }

    const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false });

    const start = Date.now();
    let compiled = 0;
    let failed = 0;

    for (const s of allSchemas) {
      try {
        ajv.compile(s.raw);
        compiled++;
      } catch {
        failed++;
      }
    }

    const duration = Date.now() - start;
    console.log(`[BENCHMARK] Compiled ${compiled} schemas (${failed} failed) in ${duration}ms`);
    console.log(`[BENCHMARK] Average: ${(duration / Math.max(compiled, 1)).toFixed(2)}ms per schema`);

    expect(compiled).toBeGreaterThan(0);
  });

  it('should benchmark cache lookup throughput', () => {
    const cache = new SchemaCacheService(10000);

    for (let i = 0; i < 1000; i++) {
      cache.setMeta(`schema-${i}` as any, { $id: `schema-${i}` } as any);
    }

    const iterations = 10000;
    const start = Date.now();

    for (let i = 0; i < iterations; i++) {
      cache.getMeta(`schema-${i % 1000}` as any);
    }

    const duration = Date.now() - start;
    const opsPerMs = iterations / duration;
    console.log(`[BENCHMARK] Cache: ${iterations} lookups in ${duration}ms (${opsPerMs.toFixed(1)} ops/ms)`);

    const stats = cache.getStats();
    expect(stats.hits).toBe(iterations);
    expect(stats.misses).toBe(0);
  });

  it('should benchmark cache miss throughput', () => {
    const cache = new SchemaCacheService(10000);
    const iterations = 10000;
    const start = Date.now();

    for (let i = 0; i < iterations; i++) {
      cache.getMeta(`nonexistent-${i}` as any);
    }

    const duration = Date.now() - start;
    const opsPerMs = iterations / duration;
    console.log(`[BENCHMARK] Cache misses: ${iterations} lookups in ${duration}ms (${opsPerMs.toFixed(1)} ops/ms)`);

    const stats = cache.getStats();
    expect(stats.misses).toBe(iterations);
  });

  it('should benchmark SchemaCompilerService compile', () => {
    if (isRunningInCI()) {
      return;
    }

    const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false });
    const cache = new SchemaCacheService(500);
  const compiler = new SchemaCompilerService(ajv as any, cache);

    const sample = allSchemas.slice(0, 50);

    for (const s of sample) {
      compiler.registerSchema(s.raw.$id as string as any, s.raw);
    }

    const start = Date.now();
    let success = 0;

    for (const s of sample) {
      const result = compiler.compile(s.raw.$id as string as any);
      if (result.success) success++;
    }

    const duration = Date.now() - start;
    console.log(`[BENCHMARK] CompilerService: compiled ${success}/${sample.length} in ${duration}ms`);
  });
});
