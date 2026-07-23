import { IntegrationRegistry, DomainType } from '../integration-registry.js';

export interface ConsistencyCheck {
  checkName: string;
  description: string;
  domains: DomainType[];
  passed: boolean;
  details: string[];
}

export class ConsistencyValidator {
  private readonly checks: Array<() => Promise<ConsistencyCheck>> = [];

  constructor(private readonly registry: IntegrationRegistry) {}

  addCheck(check: () => Promise<ConsistencyCheck>): void {
    this.checks.push(check);
  }

  async validate(): Promise<ConsistencyCheck[]> {
    const results = await Promise.all(this.checks.map(c => c()));
    return results;
  }

  async validateWithFilter(domains: DomainType[]): Promise<ConsistencyCheck[]> {
    const all = await this.validate();
    return all.filter(c => c.domains.some(d => domains.includes(d)));
  }

  async isConsistent(): Promise<boolean> {
    const results = await this.validate();
    return results.every(r => r.passed);
  }

  getCheckCount(): number {
    return this.checks.length;
  }
}
