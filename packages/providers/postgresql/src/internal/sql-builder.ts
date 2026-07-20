export class SQLBuilder {
  private readonly clauses: string[] = [];
  private readonly parameters: unknown[] = [];
  private paramIndex = 0;

  append(sql: string, ...params: unknown[]): SQLBuilder {
    this.clauses.push(sql);
    this.parameters.push(...params);
    return this;
  }

  appendRaw(sql: string): SQLBuilder {
    this.clauses.push(sql);
    return this;
  }

  addParam(value: unknown): number {
    this.parameters.push(value);
    return ++this.paramIndex;
  }

  addParams(values: unknown[]): number[] {
    return values.map(v => this.addParam(v));
  }

  getParams(): unknown[] {
    return [...this.parameters];
  }

  getParamIndex(): number {
    return this.paramIndex;
  }

  build(): { sql: string; params: unknown[] } {
    return {
      sql: this.clauses.join(' '),
      params: this.parameters,
    };
  }

  static identifier(name: string): string {
    return `"${name.replace(/"/g, '""')}"`;
  }

  static paramRef(index: number): string {
    return `$${index}`;
  }

  static asParam(value: unknown): string {
    return value === null ? 'NULL' : `$${1}`;
  }

  static buildInsert(table: string, data: Record<string, unknown>): { sql: string; params: unknown[] } {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const paramRefs = values.map((_, i) => `$${i + 1}`);
    const sql = `INSERT INTO ${SQLBuilder.identifier(table)} (${columns.map(c => SQLBuilder.identifier(c)).join(', ')}) VALUES (${paramRefs.join(', ')})`;
    return { sql, params: values };
  }

  static buildUpdate(table: string, data: Record<string, unknown>, whereColumn: string): { sql: string; params: unknown[] } {
    const entries = Object.entries(data);
    const setClauses = entries.map(([col], i) => `${SQLBuilder.identifier(col)} = $${i + 1}`);
    const params = entries.map(([, val]) => val);
    const whereRef = `$${params.length + 1}`;
    const sql = `UPDATE ${SQLBuilder.identifier(table)} SET ${setClauses.join(', ')} WHERE ${SQLBuilder.identifier(whereColumn)} = ${whereRef}`;
    return { sql, params };
  }

  static buildSelect(table: string, columns: string[] = ['*']): string {
    return `SELECT ${columns.map(c => SQLBuilder.identifier(c)).join(', ')} FROM ${SQLBuilder.identifier(table)}`;
  }

  static buildDelete(table: string): string {
    return `DELETE FROM ${SQLBuilder.identifier(table)}`;
  }
}
