import { Injectable } from '@nestjs/common';
import type { SearchResult, SearchHit, AggregationResult, AggregationBucket, FacetResult } from './types';

@Injectable()
export class SearchResultMapper {
  map(raw: Record<string, unknown>): SearchResult {
    const hits = raw.hits as Record<string, unknown> | undefined;
    const innerHits = hits?.hits as Array<Record<string, unknown>> | undefined;
    const aggregations = raw.aggregations as Record<string, unknown> | undefined;

    const total =
      typeof hits?.total === 'number'
        ? (hits.total as number)
        : typeof hits?.total === 'object'
          ? ((hits.total as Record<string, unknown>).value as number) ?? 0
          : 0;

    const maxScore = typeof hits?.max_score === 'number' ? hits.max_score as number : 0;

    return {
      took: (raw.took as number) ?? 0,
      total,
      maxScore,
      hits: innerHits?.map(h => this.mapHit(h)) ?? [],
      aggregations: aggregations ? this.mapAggregations(aggregations) : undefined,
      suggests: raw.suggest as Record<string, unknown[]> | undefined,
      timedOut: (raw.timed_out as boolean) ?? false,
      shards: this.mapShards(raw._shards as Record<string, unknown> | undefined),
    };
  }

  mapHit(raw: Record<string, unknown>): SearchHit {
    return {
      id: (raw._id as string) ?? '',
      index: (raw._index as string) ?? '',
      score: (raw._score as number) ?? 0,
      source: (raw._source as Record<string, unknown>) ?? {},
      highlight: raw.highlight as Record<string, string[]> | undefined,
      sort: raw.sort as unknown[] | undefined,
      innerHits: raw.inner_hits as Record<string, { hits: SearchHit[] }> | undefined,
      matchedQueries: raw.matched_queries as string[] | undefined,
      explanation: raw._explanation as Record<string, unknown> | undefined,
    };
  }

  mapAggregations(raw: Record<string, unknown>): Record<string, AggregationResult> {
    const result: Record<string, AggregationResult> = {};
    for (const [key, value] of Object.entries(raw)) {
      result[key] = this.mapAggregation(value as Record<string, unknown>);
    }
    return result;
  }

  mapAggregation(raw: Record<string, unknown>): AggregationResult {
    const agg: AggregationResult = {};

    if (raw.value !== undefined) agg.value = raw.value as number;
    if (raw.values !== undefined) agg.values = raw.values as Record<string, number>;
    if (raw.buckets !== undefined) {
      agg.buckets = (raw.buckets as Array<Record<string, unknown>>).map(b => this.mapBucket(b));
    }
    if (raw.sum_other_doc_count !== undefined) agg.sumOtherDocCount = raw.sum_other_doc_count as number;
    if (raw.doc_count_error_upper_bound !== undefined) agg.docCountErrorUpperBound = raw.doc_count_error_upper_bound as number;
    if (raw.hits !== undefined) agg.hits = raw.hits as { hits: SearchHit[] };
    if (raw.meta !== undefined) agg.meta = raw.meta as Record<string, unknown>;

    const subAggs = Object.fromEntries(
      Object.entries(raw).filter(([k]) => !['value', 'values', 'buckets', 'sum_other_doc_count', 'doc_count_error_upper_bound', 'hits', 'meta'].includes(k)),
    );
    if (Object.keys(subAggs).length > 0) {
      agg.aggResult = this.mapAggregations(subAggs);
    }

    return agg;
  }

  mapBucket(raw: Record<string, unknown>): AggregationBucket {
    const bucket: AggregationBucket = {
      key: raw.key as string | number,
      docCount: (raw.doc_count as number) ?? 0,
    };
    if (raw.key_as_string !== undefined) bucket.keyAsString = raw.key_as_string as string;
    if (raw.from !== undefined) bucket.from = raw.from as number;
    if (raw.to !== undefined) bucket.to = raw.to as number;
    if (raw.from_as_string !== undefined) bucket.fromAsString = raw.from_as_string as string;
    if (raw.to_as_string !== undefined) bucket.toAsString = raw.to_as_string as string;

    const subAggs = Object.fromEntries(
      Object.entries(raw).filter(([k]) => !['key', 'key_as_string', 'doc_count', 'from', 'to', 'from_as_string', 'to_as_string'].includes(k)),
    );
    if (Object.keys(subAggs).length > 0) {
      bucket.aggResult = this.mapAggregations(subAggs);
    }

    return bucket;
  }

  toFacetResult(raw: Record<string, unknown>, field: string): FacetResult {
    const buckets = ((raw.buckets as Array<Record<string, unknown>>) ?? []).map(b => ({
      value: String(b.key as string | number),
      count: (b.doc_count as number) ?? 0,
    }));

    return {
      field,
      total: buckets.reduce((sum, b) => sum + b.count, 0),
      other: (raw.sum_other_doc_count as number) ?? 0,
      missing: (raw.doc_count_error_upper_bound as number) ?? 0,
      buckets,
    };
  }

  private mapShards(raw: Record<string, unknown> | undefined) {
    return {
      total: (raw?.total as number) ?? 0,
      successful: (raw?.successful as number) ?? 0,
      failed: (raw?.failed as number) ?? 0,
      skipped: (raw?.skipped as number) ?? 0,
    };
  }
}
