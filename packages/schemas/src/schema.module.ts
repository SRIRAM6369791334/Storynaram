import type { DynamicModule } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { RegistryConfig } from './types.js';
import { SchemaRegistryService } from './schema-registry.service.js';
import { SchemaDiscoveryService } from './schema-discovery.service.js';
import { SchemaLoaderService } from './schema-loader.service.js';
import { SchemaMetadataService } from './schema-metadata.service.js';
import { SchemaCompilerService } from './schema-compiler.service.js';
import { SchemaCacheService } from './schema-cache.service.js';
import { SchemaResolverService } from './schema-resolver.service.js';
import { SchemaDependencyGraphService } from './schema-dependency-graph.service.js';
import { SchemaIndexService } from './schema-index.service.js';

export interface AjvConfig {
  strict?: boolean;
  allErrors?: boolean;
}

export class SchemaModule {
  static forRoot(config?: AjvConfig & { registry?: RegistryConfig }): DynamicModule {
    const ajv = new Ajv({
      strict: config?.strict ?? true,
      allErrors: config?.allErrors ?? true,
      validateSchema: false,
    });
    addFormats(ajv);

    return {
      module: SchemaModule,
      global: true,
      providers: [
        { provide: 'AJV_INSTANCE', useValue: ajv },
        { provide: 'REGISTRY_CONFIG', useValue: config?.registry ?? {} },
        Logger,
        SchemaCacheService,
        SchemaDiscoveryService,
        SchemaLoaderService,
        SchemaMetadataService,
        SchemaCompilerService,
        SchemaResolverService,
        SchemaDependencyGraphService,
        SchemaIndexService,
        SchemaRegistryService,
      ],
      exports: [
        SchemaRegistryService,
        SchemaCompilerService,
        SchemaIndexService,
        SchemaCacheService,
        'AJV_INSTANCE',
      ],
    };
  }
}
