import { DomainContext } from './domain-context';

export interface PolicyEvaluationResult {
  allowed: boolean;
  reason?: string;
}

export abstract class DomainPolicy {
  abstract get policyName(): string;

  abstract evaluate(context: DomainContext, payload?: Record<string, unknown>): Promise<PolicyEvaluationResult>;

  async isAllowed(context: DomainContext, payload?: Record<string, unknown>): Promise<boolean> {
    const result = await this.evaluate(context, payload);
    return result.allowed;
  }
}
