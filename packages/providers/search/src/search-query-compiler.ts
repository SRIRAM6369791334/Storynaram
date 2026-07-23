import { Injectable } from '@nestjs/common';
import type { SearchQuery, QueryClause, BoolQuery } from './types.js';
import { InvalidQueryError } from './errors.js';

@Injectable()
export class SearchQueryCompiler {
  compile(query: SearchQuery): CompiledSearchQuery {
    this.validate(query);

    return {
      index: query.index,
      body: {
        query: this.compileClause(query.query),
        from: query.from ?? 0,
        size: query.size ?? 20,
        sort: query.sort?.map(s => ({ [s.field]: { order: s.order ?? 'desc', mode: s.mode, missing: s.missing } })),
        _source: query.source,
        aggs: query.aggregations,
        highlight: query.highlight ? {
          fields: Object.fromEntries(query.highlight.fields.map(f => [f, {}])),
          pre_tags: query.highlight.preTags,
          post_tags: query.highlight.postTags,
          fragment_size: query.highlight.fragmentSize,
          number_of_fragments: query.highlight.numberOfFragments,
          require_field_match: query.highlight.requireFieldMatch,
          type: query.highlight.type,
        } : undefined,
        suggest: query.suggest,
        search_after: query.searchAfter,
        track_total_hits: query.trackTotalHits,
        timeout: query.timeout,
      },
    };
  }

  compileClause(clause: QueryClause): Record<string, unknown> {
    if ('match_all' in clause) return { match_all: clause.match_all };
    if ('match' in clause) return { match: clause.match };
    if ('term' in clause) return { term: clause.term };
    if ('terms' in clause) return { terms: clause.terms };
    if ('range' in clause) return { range: clause.range };
    if ('prefix' in clause) return { prefix: clause.prefix };
    if ('wildcard' in clause) return { wildcard: clause.wildcard };
    if ('fuzzy' in clause) return { fuzzy: clause.fuzzy };
    if ('exists' in clause) return { exists: clause.exists };
    if ('multi_match' in clause) return { multi_match: clause.multi_match };
    if ('nested' in clause) return { nested: clause.nested };
    if ('bool' in clause) return this.compileBool(clause.bool);
    if ('dis_max' in clause) return { dis_max: { ...clause.dis_max, queries: clause.dis_max.queries.map(q => this.compileClause(q)) } };
    if ('constant_score' in clause) return { constant_score: { ...clause.constant_score, filter: this.compileClause(clause.constant_score.filter) } };
    if ('boosting' in clause) return { boosting: { ...clause.boosting, positive: this.compileClause(clause.boosting.positive), negative: this.compileClause(clause.boosting.negative) } };
    if ('function_score' in clause) return { function_score: { ...clause.function_score, query: this.compileClause(clause.function_score.query) } };
    if ('geo_distance' in clause) return { geo_distance: clause.geo_distance };
    if ('geo_bounding_box' in clause) return { geo_bounding_box: clause.geo_bounding_box };
    if ('script' in clause) return { script: clause.script };
    if ('match_phrase' in (clause as Record<string, unknown>)) return clause as Record<string, unknown>;

    throw new InvalidQueryError(`Unknown query clause type: ${JSON.stringify(clause).slice(0, 100)}`);
  }

  private compileBool(bool: BoolQuery['bool']): { bool: Record<string, unknown> } {
    const result: Record<string, unknown> = {};
    if (bool.must) result.must = bool.must.map((q: QueryClause) => this.compileClause(q));
    if (bool.should) result.should = bool.should.map((q: QueryClause) => this.compileClause(q));
    if (bool.filter) result.filter = bool.filter.map((q: QueryClause) => this.compileClause(q));
    if (bool.mustNot) result.must_not = bool.mustNot.map((q: QueryClause) => this.compileClause(q));
    if (bool.minimumShouldMatch !== undefined) result.minimum_should_match = bool.minimumShouldMatch;
    if (bool.boost !== undefined) result.boost = bool.boost;
    return { bool: result };
  }

  validate(query: SearchQuery): void {
    if (!query.index) throw new InvalidQueryError('index is required');
    if (!query.query) throw new InvalidQueryError('query is required');
    if (query.from != null && query.from < 0) throw new InvalidQueryError('from must be >= 0');
    if (query.size != null && query.size < 0) throw new InvalidQueryError('size must be >= 0');
    if ((query.from ?? 0) + (query.size ?? 20) > 10000 && !query.searchAfter) {
      throw new InvalidQueryError('deep pagination requires searchAfter');
    }
  }
}

export interface CompiledSearchQuery {
  index: string;
  body: Record<string, unknown>;
}
