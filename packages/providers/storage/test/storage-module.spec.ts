import { describe, it, expect } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { StorageModule } from '../src/storage.module';
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
} from '../src/tokens';
import { StorageClient } from '../src/storage-client';
import { StorageRegistry } from '../src/storage-registry';
import { BucketManager } from '../src/bucket-manager';

describe('StorageModule', () => {
  it('forRoot creates a working module with memory provider', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        StorageModule.forRoot({
          providers: [
            {
              name: 'default',
              type: 'memory',
            },
          ],
          defaultProvider: 'default',
        }),
      ],
    }).compile();

    const client = moduleRef.get<StorageClient>(STORAGE_CLIENT);
    expect(client).toBeDefined();
    expect(client.providerName).toBe('default');

    const registry = moduleRef.get<StorageRegistry>(STORAGE_REGISTRY);
    expect(registry).toBeDefined();
    expect(registry.getAllProviders()).toContain('default');

    const bucketManager = moduleRef.get<BucketManager>(STORAGE_BUCKET_MANAGER);
    expect(bucketManager).toBeDefined();

    await bucketManager.create('module-test-bucket');
    expect(await bucketManager.exists('module-test-bucket')).toBe(true);

    const objectManager = moduleRef.get(STORAGE_OBJECT_MANAGER);
    expect(objectManager).toBeDefined();

    const multipartManager = moduleRef.get(STORAGE_MULTIPART_UPLOAD_MANAGER);
    expect(multipartManager).toBeDefined();

    const signedUrlService = moduleRef.get(STORAGE_SIGNED_URL_SERVICE);
    expect(signedUrlService).toBeDefined();

    const metadataService = moduleRef.get(STORAGE_METADATA_SERVICE);
    expect(metadataService).toBeDefined();

    const lifecycleManager = moduleRef.get(STORAGE_LIFECYCLE_MANAGER);
    expect(lifecycleManager).toBeDefined();

    const replicationManager = moduleRef.get(STORAGE_REPLICATION_MANAGER);
    expect(replicationManager).toBeDefined();

    const versionManager = moduleRef.get(STORAGE_VERSION_MANAGER);
    expect(versionManager).toBeDefined();

    const healthIndicator = moduleRef.get(STORAGE_HEALTH_INDICATOR);
    expect(healthIndicator).toBeDefined();

    const metricsCollector = moduleRef.get(STORAGE_METRICS_COLLECTOR);
    expect(metricsCollector).toBeDefined();

    const statisticsService = moduleRef.get(STORAGE_STATISTICS_SERVICE);
    expect(statisticsService).toBeDefined();
  });

  it('forRoot configures multiple providers', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        StorageModule.forRoot({
          providers: [
            { name: 'primary', type: 'memory' },
            { name: 'secondary', type: 'memory' },
          ],
          defaultProvider: 'primary',
        }),
      ],
    }).compile();

    const registry = moduleRef.get<StorageRegistry>(STORAGE_REGISTRY);
    expect(registry.getAllProviders()).toHaveLength(2);
    expect(registry.getAllProviders()).toContain('primary');
    expect(registry.getAllProviders()).toContain('secondary');
  });

  it('forRootAsync configures module', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        StorageModule.forRootAsync({
          useFactory: () => ({
            providers: [{ name: 'async-provider', type: 'memory' }],
            defaultProvider: 'async-provider',
          }),
          inject: [],
        }),
      ],
    }).compile();

    const options = moduleRef.get(STORAGE_MODULE_OPTIONS);
    expect(options).toBeDefined();
    expect(options.defaultProvider).toBe('async-provider');
  });
});
