import { IntegrationRegistry, DomainType } from '../integration-registry';

export interface ValidationIssue {
  domain: DomainType;
  entityId: string;
  entityType: string;
  issue: string;
  severity: 'error' | 'warning' | 'info';
  relatedDomain?: DomainType;
  relatedId?: string;
}

export interface ValidationRule {
  name: string;
  domain: DomainType;
  validate: () => Promise<ValidationIssue[]>;
}

export class CrossDomainValidator {
  private readonly rules: ValidationRule[] = [];

  constructor(private readonly registry: IntegrationRegistry) {}

  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  addRules(rules: ValidationRule[]): void {
    this.rules.push(...rules);
  }

  async validateAll(): Promise<ValidationIssue[]> {
    const results = await Promise.all(this.rules.map(r => r.validate()));
    return results.flat();
  }

  async validateForDomain(domain: DomainType): Promise<ValidationIssue[]> {
    const domainRules = this.rules.filter(r => r.domain === domain);
    const results = await Promise.all(domainRules.map(r => r.validate()));
    return results.flat();
  }

  async validateForDomains(domains: DomainType[]): Promise<ValidationIssue[]> {
    const domainSet = new Set(domains);
    const filtered = this.rules.filter(r => domainSet.has(r.domain));
    const results = await Promise.all(filtered.map(r => r.validate()));
    return results.flat();
  }

  getRules(): readonly ValidationRule[] {
    return [...this.rules];
  }

  getRuleCount(): number {
    return this.rules.length;
  }
}
