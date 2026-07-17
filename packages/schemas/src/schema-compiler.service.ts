import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { default as Ajv, ValidateFunction } from 'ajv';
import { SchemaCacheService } from './schema-cache.service';
import type { SchemaId, CompilationResult } from './types';

@Injectable()
export class SchemaCompilerService implements OnModuleInit {
  private readonly schemaMap = new Map<SchemaId, object>();
  private readonly isReady = false;

  constructor(
    @Inject('AJV_INSTANCE') private readonly ajv: Ajv,
    private readonly cache: SchemaCacheService,
  ) {}

  onModuleInit(): void {
    this.ajv.addVocabulary(['description', '$id', '$schema', 'title', 'default', 'examples']);
  }

  registerSchema(schemaId: SchemaId, schema: object): void {
    this.ajv.addSchema(schema, schemaId);
    this.schemaMap.set(schemaId, schema);
  }

  registerSchemas(schemas: { schemaId: SchemaId; schema: object }[]): void {
    for (const { schemaId, schema } of schemas) {
      this.registerSchema(schemaId, schema);
    }
  }

  compile(schemaId: SchemaId, raw?: object): CompilationResult {
    const start = Date.now();
    
    // Check cache first
    const cached = this.cache.getCompiled(schemaId);
    if (cached !== undefined) {
      return { success: true, schemaId, duration: Date.now() - start };
    }

    try {
      const schema = raw ?? this.schemaMap.get(schemaId);
      if (!schema) {
        return { success: false, schemaId, errors: [`Schema ${schemaId} not registered`], duration: Date.now() - start };
      }
      
      const validate = this.ajv.compile(schema);
      this.cache.setCompiled(schemaId, validate);
      
      return { success: true, schemaId, duration: Date.now() - start };
    } catch (err) {
      const errors = [(err as Error).message];
      return { success: false, schemaId, errors, duration: Date.now() - start };
    }
  }

  compileAll(schemaIds: SchemaId[]): CompilationResult[] {
    return schemaIds.map(id => this.compile(id));
  }

  validate(schemaId: SchemaId, data: unknown): { valid: boolean; errors?: string[] } {
    const cached = this.cache.getCompiled(schemaId);
    if (!cached) {
      const result = this.compile(schemaId);
      if (!result.success) {
        return { valid: false, errors: [`Schema ${schemaId} not compiled: ${result.errors?.join(', ')}`] };
      }
    }
    
    const validate = this.cache.getCompiled(schemaId);
    if (!validate) {
      return { valid: false, errors: [`Schema ${schemaId} not available`] };
    }

    const fn = validate as ValidateFunction;
    const valid = fn(data);
    if (!valid && fn.errors) {
      return {
        valid: false,
        errors: fn.errors.map(e => `${e.instancePath} ${String(e.message ?? '')}`),
      };
    }
    return { valid: true };
  }

  isSchemaRegistered(schemaId: SchemaId): boolean {
    return this.schemaMap.has(schemaId) || this.ajv.getSchema(schemaId) !== undefined;
  }

  removeSchema(schemaId: SchemaId): void {
    this.ajv.removeSchema(schemaId);
    this.schemaMap.delete(schemaId);
  }

  clear(): void {
    this.schemaMap.clear();
    this.cache.clearCompiled();
  }
}
