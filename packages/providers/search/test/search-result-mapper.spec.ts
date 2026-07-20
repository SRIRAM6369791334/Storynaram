import { describe, it, expect } from 'vitest';
import { SearchResultMapper } from '../src/search-result-mapper';

describe('SearchResultMapper', () => {
  const mapper = new SearchResultMapper();

  it('maps a basic search result', () => {
    const raw = {
      took: 5,
      timed_out: false,
      _shards: { total: 2, successful: 2, failed: 0, skipped: 0 },
      hits: {
        total: { value: 3, relation: 'eq' },
        max_score: 1.5,
        hits: [
          { _index: 'idx', _id: '1', _score: 1.5, _source: { title: 'doc1' } },
          { _index: 'idx', _id: '2', _score: 1.0, _source: { title: 'doc2' } },
        ],
      },
    };

    const result = mapper.map(raw);
    expect(result.took).toBe(5);
    expect(result.total).toBe(3);
    expect(result.maxScore).toBe(1.5);
    expect(result.hits).toHaveLength(2);
    expect(result.hits[0].id).toBe('1');
    expect(result.hits[0].source.title).toBe('doc1');
    expect(result.shards.successful).toBe(2);
  });

  it('handles integer total', () => {
    const raw = {
      took: 1, timed_out: false, _shards: {},
      hits: { total: 5, max_score: 1, hits: [] },
    };
    expect(mapper.map(raw).total).toBe(5);
  });

  it('maps aggregations with buckets', () => {
    const raw = {
      took: 1, timed_out: false, _shards: {},
      hits: { total: 3, max_score: 1, hits: [] },
      aggregations: {
        colors: {
          buckets: [
            { key: 'red', doc_count: 10 },
            { key: 'blue', doc_count: 5 },
          ],
        },
        avg_price: { value: 42.5 },
      },
    };

    const result = mapper.map(raw);
    expect(result.aggregations?.colors.buckets).toHaveLength(2);
    expect(result.aggregations?.colors.buckets![0].key).toBe('red');
    expect(result.aggregations?.colors.buckets![0].docCount).toBe(10);
    expect(result.aggregations?.avg_price.value).toBe(42.5);
  });

  it('maps sub-aggregations', () => {
    const raw = {
      took: 1, timed_out: false, _shards: {},
      hits: { total: 1, max_score: 1, hits: [] },
      aggregations: {
        by_category: {
          buckets: [
            {
              key: 'electronics',
              doc_count: 5,
              avg_price: { value: 299.99 },
            },
          ],
        },
      },
    };

    const result = mapper.map(raw);
    const bucket = result.aggregations!.by_category.buckets![0];
    expect(bucket.aggResult?.avg_price.value).toBe(299.99);
  });

  it('converts aggregation to FacetResult', () => {
    const agg = {
      buckets: [
        { key: 'a', doc_count: 10 },
        { key: 'b', doc_count: 5 },
      ],
      sum_other_doc_count: 2,
      doc_count_error_upper_bound: 0,
    };

    const facet = mapper.toFacetResult(agg, 'category');
    expect(facet.field).toBe('category');
    expect(facet.total).toBe(15);
    expect(facet.buckets).toHaveLength(2);
    expect(facet.buckets[0]).toEqual({ value: 'a', count: 10 });
  });

  it('maps highlight results', () => {
    const raw = {
      took: 1, timed_out: false, _shards: {},
      hits: {
        total: 1, max_score: 1,
        hits: [{ _index: 'idx', _id: '1', _score: 1, _source: {}, highlight: { title: ['<em>hello</em>'] } }],
      },
    };

    const result = mapper.map(raw);
    expect(result.hits[0].highlight?.title).toEqual(['<em>hello</em>']);
  });

  it('maps nested inner hits', () => {
    const raw = {
      took: 1, timed_out: false, _shards: {},
      hits: {
        total: 1, max_score: 1,
        hits: [{
          _index: 'idx', _id: '1', _score: 1, _source: {},
          inner_hits: { items: { hits: { hits: [{ _id: 'n1', _index: 'idx', _score: 1, _source: {} }] } } },
        }],
      },
    };

    const result = mapper.map(raw);
    expect(result.hits[0].innerHits?.items.hits.hits).toHaveLength(1);
  });
});
