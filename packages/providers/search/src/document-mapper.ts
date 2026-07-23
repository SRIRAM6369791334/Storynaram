import { Injectable } from '@nestjs/common';
import type { SearchDocument, SearchHit } from './types.js';

@Injectable()
export class DocumentMapper {
  toDocument(index: string, id: string, body: Record<string, unknown>): SearchDocument {
    return { index, id, body: this.sanitize(body) };
  }

  fromHit(hit: SearchHit): SearchDocument {
    return {
      index: hit.index,
      id: hit.id,
      body: hit.source,
    };
  }

  toBulkAction(action: 'index' | 'update' | 'delete' | 'create', document: SearchDocument) {
    const meta = { [`${action}`]: { _index: document.index, _id: document.id } };
    if (action === 'delete') return [meta];
    return [meta, document.body];
  }

  extractField(document: SearchDocument, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = document.body;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }
    return current;
  }

  flatten(document: SearchDocument): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    this.flattenObject(document.body, '', result);
    return { _id: document.id, _index: document.index, ...result };
  }

  private flattenObject(obj: Record<string, unknown>, prefix: string, result: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value != null && typeof value === 'object' && !Array.isArray(value)) {
        this.flattenObject(value as Record<string, unknown>, path, result);
      } else if (Array.isArray(value)) {
        result[path] = value;
      } else {
        result[path] = value;
      }
    }
  }

  private sanitize(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;
      if (value instanceof Date) {
        result[key] = value.toISOString();
      } else if (value != null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.sanitize(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}
