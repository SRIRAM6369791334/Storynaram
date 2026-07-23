import { Module, Global, DynamicModule, Provider, Logger } from '@nestjs/common';
import { StorageClient } from './storage-client.js';
import { StorageRegistry } from './storage-registry.js';
import { BucketManager } from './bucket-manager.js';
import { ObjectManager } from './object-manager.js';
import { MultipartUploadManager } from './multipart-upload-manager.js';
import { SignedUrlService } from './signed-url-service.js';
import { MetadataService } from './metadata-service.js';
import { LifecycleManager } from './lifecycle-manager.js';
import { ReplicationManager } from './replication-manager.js';
import { VersionManager } from './version-manager.js';
import { StorageHealthIndicator } from './observability/health-indicator.js';
import { StorageMetricsCollector } from './observability/metrics-collector.js';
import { StorageStatisticsService } from './observability/statistics-service.js';
import { S3Adapter } from './adapters/s3.adapter.js';
import { MinIOAdapter } from './adapters/minio.adapter.js';
import { AzureBlobAdapter } from './adapters/azure-blob.adapter.js';
import { LocalFSAdapter } from './adapters/local-fs.adapter.js';
import { MemoryAdapter } from './adapters/memory.adapter.js';
import {
  STORAGE_MODULE_OPTIONS,
  STORAGE_CLIENT,
  STORAGE_REGISTRY,
  STORAGE_BUCKET_MANAGER,
  STORAGE_OBJECT_MANAGER,
  STORAGE_MULTIPART_UPLOAD_MANAGER,
  STORAGE_SIGNED_URL_SERVICE,
  STORAGE_METADATA_SERVICE,
  STORAGE_LIFECYCLE_MANAGER,
  STORAGE_REPLICATION_MANAGER,
  STORAGE_VERSION_MANAGER,
  STORAGE_HEALTH_INDICATOR,
  STORAGE_METRICS_COLLECTOR,
  STORAGE_STATISTICS_SERVICE,
  getStorageClientToken,
  getStorageProviderConfigToken,
} from './tokens.js';
import type { StorageModuleOptions, StorageProviderConfig } from './types.js';
import type { StorageModuleAsyncOptions } from './tokens.js';
import type { IStorageAdapter } from './adapters/storage-adapter.interface.js';

function createAdapter(config: StorageProviderConfig): IStorageAdapter {
  const logger = new Logger('StorageAdapterFactory');
  logger.log(`Creating adapter for provider ${config.name} (type: ${config.type})`);

  switch (config.type) {
    case 's3':
      return new S3Adapter(config.name, {
        endpoint: config.endpoint,
        region: config.region,
        credentials: config.credentials as any,
        tls: config.tls,
        forcePathStyle: false,
      });
    case 'minio':
      return new MinIOAdapter(config.name, {
        endpoint: config.endpoint!,
        region: config.region,
        credentials: config.credentials as any,
        tls: config.tls,
        forcePathStyle: true,
      });
    case 'azure-blob':
      return new AzureBlobAdapter(config.name, {
        connectionString: config.credentials?.connectionString,
        accountName: config.credentials?.accountName,
        accountKey: config.credentials?.accountKey,
      });
    case 'local-fs':
      return new LocalFSAdapter(config.name, {
        basePath: config.endpoint,
      });
    case 'memory':
      return new MemoryAdapter(config.name);
    default:
      throw new Error(`Unsupported storage provider type: ${config.type}`);
  }
}

function createClientProvider(config: StorageProviderConfig): Provider[] {
  const clientToken = getStorageClientToken(config.name);
  const configToken = getStorageProviderConfigToken(config.name);

  return [
    {
      provide: configToken,
      useValue: config,
    },
    {
      provide: clientToken,
      useFactory: async () => {
        const adapter = createAdapter(config);
        const client = new StorageClient(adapter);
        await client.connect();
        return client;
      },
    },
  ];
}

function createManagerProviders(clientToken: symbol): Provider[] {
  return [
    {
      provide: STORAGE_BUCKET_MANAGER,
      useFactory: (client: StorageClient) => new BucketManager(client),
      inject: [clientToken],
    },
    {
      provide: STORAGE_OBJECT_MANAGER,
      useFactory: (client: StorageClient) => new ObjectManager(client),
      inject: [clientToken],
    },
    {
      provide: STORAGE_MULTIPART_UPLOAD_MANAGER,
      useFactory: (client: StorageClient) => new MultipartUploadManager(client),
      inject: [clientToken],
    },
    {
      provide: STORAGE_SIGNED_URL_SERVICE,
      useFactory: (client: StorageClient) => new SignedUrlService(client),
      inject: [clientToken],
    },
    {
      provide: STORAGE_METADATA_SERVICE,
      useFactory: (client: StorageClient) => new MetadataService(client),
      inject: [clientToken],
    },
    {
      provide: STORAGE_LIFECYCLE_MANAGER,
      useFactory: (client: StorageClient) => new LifecycleManager(client),
      inject: [clientToken],
    },
    {
      provide: STORAGE_REPLICATION_MANAGER,
      useFactory: (client: StorageClient) => new ReplicationManager(client),
      inject: [clientToken],
    },
    {
      provide: STORAGE_VERSION_MANAGER,
      useFactory: (client: StorageClient) => new VersionManager(client),
      inject: [clientToken],
    },
    {
      provide: STORAGE_HEALTH_INDICATOR,
      useFactory: (client: StorageClient) => new StorageHealthIndicator(client),
      inject: [clientToken],
    },
    {
      provide: STORAGE_METRICS_COLLECTOR,
      useFactory: () => new StorageMetricsCollector(),
      inject: [],
    },
    {
      provide: STORAGE_STATISTICS_SERVICE,
      useFactory: (client: StorageClient, health: StorageHealthIndicator, metrics: StorageMetricsCollector) =>
        new StorageStatisticsService(client, health, metrics),
      inject: [clientToken, STORAGE_HEALTH_INDICATOR, STORAGE_METRICS_COLLECTOR],
    },
  ];
}

@Global()
@Module({})
export class StorageModule {
  static forRoot(options: StorageModuleOptions): DynamicModule {
    const logger = new Logger('StorageModule');
    const defaultProviderName = options.defaultProvider ?? options.providers[0]?.name;
    const defaultClientToken = defaultProviderName ? getStorageClientToken(defaultProviderName) : STORAGE_CLIENT;

    const clientProviders = options.providers.flatMap(createClientProvider);
    const defaultClientAlias = defaultProviderName
      ? [
          {
            provide: STORAGE_CLIENT,
            useExisting: getStorageClientToken(defaultProviderName),
          },
        ]
      : [];

    const allManagerProviders = options.providers.flatMap((p: StorageProviderConfig) =>
      createManagerProviders(getStorageClientToken(p.name) as symbol),
    );

    const registryProvider: Provider = {
      provide: STORAGE_REGISTRY,
      useFactory: (...clients: StorageClient[]) => {
        const registry = new StorageRegistry();
        for (let i = 0; i < options.providers.length; i++) {
          const client = clients[i];
          const providerConfig = options.providers[i];
          if (client && providerConfig) {
            registry.register(providerConfig.name, client);
          }
        }
        return registry;
      },
      inject: options.providers.map((p: StorageProviderConfig) => getStorageClientToken(p.name)),
    };

    const optionProvider: Provider = {
      provide: STORAGE_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      module: StorageModule,
      global: true,
      providers: [
        optionProvider,
        ...clientProviders,
        ...defaultClientAlias,
        registryProvider,
        ...allManagerProviders,
      ],
      exports: [
        STORAGE_MODULE_OPTIONS,
        STORAGE_CLIENT,
        STORAGE_REGISTRY,
        STORAGE_BUCKET_MANAGER,
        STORAGE_OBJECT_MANAGER,
        STORAGE_MULTIPART_UPLOAD_MANAGER,
        STORAGE_SIGNED_URL_SERVICE,
        STORAGE_METADATA_SERVICE,
        STORAGE_LIFECYCLE_MANAGER,
        STORAGE_REPLICATION_MANAGER,
        STORAGE_VERSION_MANAGER,
        STORAGE_HEALTH_INDICATOR,
        STORAGE_METRICS_COLLECTOR,
        STORAGE_STATISTICS_SERVICE,
        ...options.providers.map((p: StorageProviderConfig) => getStorageClientToken(p.name)),
      ],
    };
  }

  static forRootAsync(options: StorageModuleAsyncOptions): DynamicModule {
    return {
      module: StorageModule,
      global: true,
      imports: options.imports ?? [],
      providers: [
        {
          provide: STORAGE_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject,
        },
      ],
      exports: [STORAGE_MODULE_OPTIONS],
    };
  }

  static forFeature(providerNames: string[]): DynamicModule {
    const providerTokens = providerNames.map(n => getStorageClientToken(n));
    return {
      module: StorageModule,
      providers: [],
      exports: providerTokens,
    };
  }
}
