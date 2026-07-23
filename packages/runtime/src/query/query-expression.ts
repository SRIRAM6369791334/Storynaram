import type { FilterOperand, LogicalGroup, QueryClause, FilterOperator } from './types.js';

export class QueryExpression {
  constructor(private readonly clause: QueryClause) {}

  static field(name: string): FieldExpressionBuilder {
    return new FieldExpressionBuilder(name);
  }

  static and(...expressions: QueryExpression[]): QueryExpression {
    return new QueryExpression({
      operator: 'and',
      conditions: expressions.map(e => e.clause),
    });
  }

  static or(...expressions: QueryExpression[]): QueryExpression {
    return new QueryExpression({
      operator: 'or',
      conditions: expressions.map(e => e.clause),
    });
  }

  static not(expression: QueryExpression): QueryExpression {
    return new QueryExpression({
      operator: 'and',
      conditions: [
        { field: '__not__', operator: 'eq', value: expression.clause } as FilterOperand,
      ],
    });
  }

  static raw(clause: QueryClause): QueryExpression {
    return new QueryExpression(clause);
  }

  static empty(): QueryExpression {
    return new QueryExpression({ operator: 'and', conditions: [] });
  }

  and(expression: QueryExpression): QueryExpression {
    const existing = this.clause;
    if (isLogicalGroup(existing) && existing.operator === 'and') {
      return new QueryExpression({
        operator: 'and',
        conditions: [...existing.conditions, expression.clause],
      });
    }
    return new QueryExpression({
      operator: 'and',
      conditions: [existing, expression.clause],
    });
  }

  or(expression: QueryExpression): QueryExpression {
    const existing = this.clause;
    if (isLogicalGroup(existing) && existing.operator === 'or') {
      return new QueryExpression({
        operator: 'or',
        conditions: [...existing.conditions, expression.clause],
      });
    }
    return new QueryExpression({
      operator: 'or',
      conditions: [existing, expression.clause],
    });
  }

  not(): QueryExpression {
    return new QueryExpression({
      operator: 'and',
      conditions: [
        { field: '__not__', operator: 'eq', value: this.clause } as FilterOperand,
      ],
    });
  }

  toClause(): QueryClause {
    return this.clause;
  }

  toFilter(): Record<string, unknown> {
    return convertToFilter(this.clause);
  }

  isEmpty(): boolean {
    if (isLogicalGroup(this.clause)) {
      return this.clause.conditions.length === 0;
    }
    return false;
  }

  static fromFilter(filter: Record<string, unknown>): QueryExpression {
    return new QueryExpression(convertFromFilter(filter));
  }
}

export class FieldExpressionBuilder {
  constructor(private readonly field: string) {}

  equals(value: unknown): QueryExpression {
    return this.make('eq', this.field, value);
  }

  notEquals(value: unknown): QueryExpression {
    return this.make('ne', this.field, value);
  }

  greaterThan(value: number): QueryExpression {
    return this.make('gt', this.field, value);
  }

  greaterThanOrEqual(value: number): QueryExpression {
    return this.make('gte', this.field, value);
  }

  lessThan(value: number): QueryExpression {
    return this.make('lt', this.field, value);
  }

  lessThanOrEqual(value: number): QueryExpression {
    return this.make('lte', this.field, value);
  }

  between(min: number, max: number): QueryExpression {
    return this.make('between', this.field, [min, max]);
  }

  contains(value: string): QueryExpression {
    return this.make('contains', this.field, value);
  }

  startsWith(value: string): QueryExpression {
    return this.make('startsWith', this.field, value);
  }

  endsWith(value: string): QueryExpression {
    return this.make('endsWith', this.field, value);
  }

  in(values: unknown[]): QueryExpression {
    return this.make('in', this.field, values);
  }

  notIn(values: unknown[]): QueryExpression {
    return this.make('notIn', this.field, values);
  }

  isNull(): QueryExpression {
    return this.make('isNull', this.field, null);
  }

  isNotNull(): QueryExpression {
    return this.make('isNotNull', this.field, null);
  }

  private make(operator: FilterOperator, field: string, value: unknown): QueryExpression {
    return new QueryExpression({ field, operator, value } as FilterOperand);
  }
}

function isLogicalGroup(clause: QueryClause): clause is LogicalGroup {
  return 'operator' in clause && 'conditions' in clause;
}

function convertToFilter(clause: QueryClause): Record<string, unknown> {
  if (isLogicalGroup(clause)) {
    if (clause.conditions.length === 1) {
      return convertToFilter(clause.conditions[0]!);
    }
    return {
      [clause.operator]: clause.conditions.map(c => convertToFilter(c)),
    };
  }
  return { [clause.field]: { [clause.operator]: clause.value } };
}

function convertFromFilter(filter: Record<string, unknown>): QueryClause {
  const keys = Object.keys(filter);
  if (keys.length === 0) {
    return { operator: 'and', conditions: [] };
  }
  if (keys.length === 1 && (keys[0] === 'and' || keys[0] === 'or')) {
    const op = keys[0] as 'and' | 'or';
    const conditions = (filter[op] as Record<string, unknown>[]).map(f => convertFromFilter(f));
    return { operator: op, conditions };
  }
  const field = keys[0]!;
  const value = filter[field] as Record<string, unknown>;
  const opKeys = Object.keys(value);
  if (opKeys.length === 1) {
    const op = opKeys[0] as FilterOperator;
    return { field, operator: op, value: value[op] };
  }
  return {
    operator: 'and',
    conditions: opKeys.map(op => ({ field, operator: op as FilterOperator, value: value[op] })),
  };
}
