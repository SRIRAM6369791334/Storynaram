import { describe, it, expect } from 'vitest';
import { SearchQueryCompiler } from '../src/search-query-compiler';
import { InvalidQueryError } from '../src/errors';

describe('SearchQueryCompiler', () => {
  const compiler = new SearchQueryCompiler();

  it('compiles a simple match_all query', () => {
    const result = compiler.compile({ index: 'idx', query: { match_all: {} } });
    expect(result.index).toBe('idx');
    expect(result.body.query).toEqual({ match_all: {} });
  });

  it('compiles bool query with must/should/filter', () => {
    const result = compiler.compile({
      index: 'idx',
      query: {
        bool: {
          must: [{ term: { status: 'active' } }],
          should: [{ match: { title: { query: 'test' } } }],
          filter: [{ term: { type: 'user' } }],
          minimumShouldMatch: 1,
        },
      },
    });
    expect(result.body.query.bool.must).toHaveLength(1);
    expect(result.body.query.bool.should).toHaveLength(1);
    expect(result.body.query.bool.filter).toHaveLength(1);
    expect(result.body.query.bool.minimum_should_match).toBe(1);
  });

  it('compiles nested query', () => {
    const result = compiler.compile({
      index: 'idx',
      query: { nested: { path: 'items', query: { term: { 'items.sku': 'abc' } }, scoreMode: 'avg' } },
    });
    expect(result.body.query.nested.path).toBe('items');
  });

  it('compiles function_score', () => {
    const result = compiler.compile({
      index: 'idx',
      query: {
        function_score: {
          query: { match_all: {} },
          functions: [{ weight: 2 }],
          scoreMode: 'multiply',
        },
      },
    });
    expect(result.body.query.function_score.functions).toHaveLength(1);
  });

  it('compiles dis_max', () => {
    const result = compiler.compile({
      index: 'idx',
      query: { dis_max: { queries: [{ term: { a: 1 } }, { term: { b: 2 } }] } },
    });
    expect(result.body.query.dis_max.queries).toHaveLength(2);
  });

  it('compiles constant_score', () => {
    const result = compiler.compile({
      index: 'idx',
      query: { constant_score: { filter: { term: { status: 'ok' } }, boost: 1.5 } },
    });
    expect(result.body.query.constant_score.filter).toBeDefined();
    expect(result.body.query.constant_score.boost).toBe(1.5);
  });

  it('compiles boosting query', () => {
    const result = compiler.compile({
      index: 'idx',
      query: { boosting: { positive: { term: { a: 1 } }, negative: { term: { b: 2 } }, negativeBoost: 0.5 } },
    });
    expect(result.body.query.boosting.positive).toBeDefined();
    expect(result.body.query.boosting.negative).toBeDefined();
  });

  it('applies pagination defaults', () => {
    const result = compiler.compile({ index: 'idx', query: { match_all: {} } });
    expect(result.body.from).toBe(0);
    expect(result.body.size).toBe(20);
  });

  it('throws on deep pagination without searchAfter', () => {
    expect(() => compiler.compile({
      index: 'idx', query: { match_all: {} }, from: 9900, size: 200,
    })).toThrow(InvalidQueryError);
  });

  it('allows deep pagination with searchAfter', () => {
    expect(() => compiler.compile({
      index: 'idx', query: { match_all: {} }, from: 0, size: 20000, searchAfter: ['abc'],
    })).not.toThrow();
  });

  it('throws on missing index', () => {
    expect(() => compiler.compile({ index: '', query: { match_all: {} } })).toThrow(InvalidQueryError);
  });

  it('throws on negative from', () => {
    expect(() => compiler.compile({ index: 'idx', query: { match_all: {} }, from: -1 })).toThrow(InvalidQueryError);
  });

  it('compiles geo_distance query', () => {
    const result = compiler.compile({
      index: 'idx',
      query: { geo_distance: { distance: '10km', field: 'location', location: { lat: 40, lon: -74 } } },
    });
    expect(result.body.query.geo_distance.distance).toBe('10km');
  });

  it('compiles script query', () => {
    const result = compiler.compile({
      index: 'idx',
      query: { script: { script: { source: "doc['price'].value > 10" } } },
    });
    expect(result.body.query.script.script.source).toBeDefined();
  });
});
