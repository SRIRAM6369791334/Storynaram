import { Injectable } from '@nestjs/common';
import { readdirSync } from 'fs';
import { join, resolve } from 'path';
import type { SchemaCategory, DiscoveryResult } from './types';

@Injectable()
export class SchemaDiscoveryService {
  private readonly defaultBasePath: string;

  constructor(basePath?: string) {
    // Default: resolve from package location to ../../../schemas/
    // In production, this might be different
    this.defaultBasePath = basePath ?? resolve(import.meta.dirname, '../../../../schemas');
  }

  discover(basePath?: string): DiscoveryResult {
    const start = Date.now();
    const root = basePath ?? this.defaultBasePath;
    const categories: SchemaCategory[] = ['core', 'domain', 'ai', 'workflow', 'validation'];
    const paths: string[] = [];
    const errors: string[] = [];

    for (const category of categories) {
      const dir = join(root, category);
      try {
        const files = readdirSync(dir).filter(f => f.endsWith('.schema.json'));
        for (const file of files) {
          paths.push(join(dir, file));
        }
      } catch (err) {
        errors.push(`Cannot read category ${category}: ${(err as Error).message}`);
      }
    }

    return {
      found: paths.length,
      categories: categories.filter(c => paths.some(p => p.includes(`/${c}/`))),
      paths,
      errors,
      duration: Date.now() - start,
    };
  }

  getDefaultBasePath(): string {
    return this.defaultBasePath;
  }
}
