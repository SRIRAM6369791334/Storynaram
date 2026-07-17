import type { DynamicModule } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { RegistryConfig } from './types';
import { SchemaRegistryService } from './schema-registry.service';
import { SchemaDiscoveryService } from './schema-discovery.service';
import { SchemaLoaderService } from './schema-loader.service';
import { SchemaMetadataService } from './schema-metadata.service';
import { SchemaCompilerService } from './schema-compiler.service';
import { SchemaCacheService } from './schema-cache.service';
import { SchemaResolverService } from './schema-resolver.service';
import { SchemaDependencyGraphService } from './schema-dependency-graph.service';
import { SchemaIndexService } from './schema-index.service';

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
