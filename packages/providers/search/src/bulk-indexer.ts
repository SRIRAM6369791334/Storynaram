import { Injectable, Inject, Logger } from '@nestjs/common';
import { SEARCH_PROVIDER } from './tokens.js';
import type { SearchProvider } from './search-provider.interface.js';
import type { BulkOperation, BulkResponse, BulkResponseItem } from './types.js';
import { BulkOperationError } from './errors.js';

@Injectable()
export class BulkIndexer {
  private readonly logger = new Logger(BulkIndexer.name);
  private static readonly DEFAULT_BATCH_SIZE = 500;
  private static readonly CONCURRENCY = 4;

  constructor(
    @Inject(SEARCH_PROVIDER) private readonly provider: SearchProvider,
  ) {}

  async index(operations: BulkOperation[], batchSize = BulkIndexer.DEFAULT_BATCH_SIZE): Promise<BulkResponse> {
    const batches = this.chunk(operations, batchSize);
    const results = await Promise.allSettled(
      batches.map(batch => this.provider.bulk(batch)),
    );

    const combined: BulkResponseItem[] = [];
    let took = 0;
    let hadErrors = false;

    for (const result of results) {
      if (result.status === 'fulfilled') {
        combined.push(...result.value.items);
        took += result.value.took;
        if (result.value.errors) hadErrors = true;
      } else {
        hadErrors = true;
        this.logger.error('Bulk batch failed', result.reason);
        const failedBatch = batches[results.indexOf(result)];
        if (!failedBatch) continue;
        for (const op of failedBatch) {
          combined.push({
            [op.action]: {
              _index: op.index,
              _id: op.id,
              _version: 0,
              result: 'noop',
              status: 500,
              error: { type: 'batch_failed', reason: (result.reason as Error).message },
            },
          } as BulkResponseItem);
        }
      }
    }

    const response: BulkResponse = { took, errors: hadErrors, items: combined };

    const errorItems = response.items.filter(i => {
      const item = Object.values(i)[0];
      return item?.error != null;
    });

    if (errorItems.length > 0) {
      throw new BulkOperationError(
        errorItems.map(item => {
          const op = Object.values(item)[0];
          return { index: op._index, id: op._id, reason: op.error?.reason ?? 'unknown' };
        }),
      );
    }

    return response;
  }

  async delete(operations: BulkOperation[], batchSize = BulkIndexer.DEFAULT_BATCH_SIZE): Promise<BulkResponse> {
    const deleteOps = operations.map(op => ({ ...op, action: 'delete' as const }));
    return this.index(deleteOps, batchSize);
  }

  async create(operations: BulkOperation[], batchSize = BulkIndexer.DEFAULT_BATCH_SIZE): Promise<BulkResponse> {
    const createOps = operations.map(op => ({ ...op, action: 'create' as const }));
    return this.index(createOps, batchSize);
  }

  async reindex(
    sourceIndex: string,
    destIndex: string,
    options?: { batchSize?: number; scrollSize?: number },
  ): Promise<{ total: number; took: number }> {
    const batchSize = options?.batchSize ?? BulkIndexer.DEFAULT_BATCH_SIZE;
    const scrollSize = options?.scrollSize ?? 1000;

    const count = await this.provider.count(sourceIndex);
    let processed = 0;
    let totalTook = 0;
    let searchAfter: unknown[] | undefined;

    while (processed < count) {
      const result = await this.provider.search({
        index: sourceIndex,
        query: { match_all: {} },
        size: scrollSize,
        searchAfter,
        source: true,
      });

      if (result.hits.length === 0) break;

      const operations: BulkOperation[] = result.hits.map(hit => ({
        action: 'index',
        index: destIndex,
        id: hit.id,
        document: hit.source,
      }));

      const batches = this.chunk(operations, batchSize);
      for (const batch of batches) {
        const bulkResult = await this.provider.bulk(batch);
        totalTook += bulkResult.took;
      }

      processed += result.hits.length;
      const lastHit = result.hits[result.hits.length - 1];
      searchAfter = lastHit?.sort;

      this.logger.debug(`Reindexed ${processed}/${count} documents`);
    }

    return { total: processed, took: totalTook };
  }

  private chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }
}
