import { Injectable } from '@nestjs/common';
import type { SchemaMeta, SchemaId } from './types';
import { InvalidSchemaError } from './errors';
import { SchemaLoaderService } from './schema-loader.service';

@Injectable()
export class SchemaMetadataService {
  constructor(private readonly loader: SchemaLoaderService) {}

  extract(filePath: string, raw: Record<string, unknown>): SchemaMeta {
    const $id = raw.$id;
    if (!$id || typeof $id !== 'string') {
      throw new InvalidSchemaError(filePath, 'Missing or invalid $id');
    }

    const category = this.loader.extractCategory(filePath);
    if (!category) {
      throw new InvalidSchemaError($id, `Cannot determine category from path: ${filePath}`);
    }

    const refs = this.loader.extractRefs(raw);
    const localRefs = this.loader.extractLocalRefs(refs);

    return {
      $id: $id as SchemaId,
      title: (raw.title as string) ?? $id,
      description: raw.description as string | undefined,
      $schema: raw.$schema as string | undefined,
      category,
      filePath,
      dependencies: localRefs.map(r => r.replace('.schema.json', '')) as SchemaId[],
      dependents: [],
      byteSize: JSON.stringify(raw).length,
    };
  }

  extractAll(loaded: Array<{ filePath: string; schema: Record<string, unknown>; error?: string }>): SchemaMeta[] {
    const result: SchemaMeta[] = [];
    for (const item of loaded) {
      if (item.error !== undefined) continue;
      try {
        result.push(this.extract(item.filePath, item.schema));
      } catch {
        // skip invalid schemas
      }
    }
    return result;
  }
}
