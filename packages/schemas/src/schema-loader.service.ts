import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import type { SchemaCategory } from './types.js';

export interface RawSchema {
  $id?: string;
  title?: string;
  description?: string;
  $schema?: string;
  [key: string]: unknown;
}

@Injectable()
export class SchemaLoaderService {
  load(filePath: string): RawSchema {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as RawSchema;
  }

  loadAll(filePaths: string[]): { filePath: string; schema: RawSchema; error?: string }[] {
    return filePaths.map(filePath => {
      try {
        return { filePath, schema: this.load(filePath) };
      } catch (err) {
        return { filePath, schema: {}, error: (err as Error).message };
      }
    });
  }

  extractCategory(filePath: string): SchemaCategory | undefined {
    const categories: SchemaCategory[] = ['core', 'domain', 'ai', 'workflow', 'validation'];
    for (const cat of categories) {
      if (filePath.includes(`/${cat}/`) || filePath.includes(`\\${cat}\\`)) {
        return cat;
      }
    }
    return undefined;
  }

  extractRefs(schema: RawSchema): string[] {
    const refs: string[] = [];
    function walk(obj: unknown): void {
      if (obj === null || typeof obj !== 'object') return;
      if (Array.isArray(obj)) {
        obj.forEach(walk);
        return;
      }
      const rec = obj as Record<string, unknown>;
      if (typeof rec.$ref === 'string') {
        refs.push(rec.$ref);
      }
      for (const val of Object.values(rec)) {
        walk(val);
      }
    }
    walk(schema);
    return refs;
  }

  extractLocalRefs(refs: string[]): string[] {
    return refs
      .filter(r => !r.startsWith('#') && !r.startsWith('http'))
      .map(r => r.split('#')[0] ?? r);
  }
}
