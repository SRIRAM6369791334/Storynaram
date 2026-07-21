import { DomainEvent } from '@storynaram/domain-kernel';
import { IntegrationRegistry, DomainType } from '../integration-registry';

export interface DomainEventHandler {
  domain: DomainType;
  handle(event: DomainEvent): Promise<void>;
}

export interface RoutingRule {
  sourceEventType: string;
  sourceDomain: DomainType;
  targetDomain: DomainType;
  transform?: (event: DomainEvent) => Record<string, unknown>;
}

export class DomainEventRouter {
  private readonly handlers = new Map<string, DomainEventHandler[]>();
  private readonly rules: RoutingRule[] = [];

  constructor(private readonly registry: IntegrationRegistry) {}

  registerHandler(eventType: string, handler: DomainEventHandler): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  addRule(rule: RoutingRule): void {
    this.rules.push(rule);
  }

  getRules(): readonly RoutingRule[] {
    return [...this.rules];
  }

  async route(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? [];
    const ruleHandlers = this.resolveRules(event);

    const allHandlers = [...handlers, ...ruleHandlers];
    await Promise.all(allHandlers.map(h => h.handle(event)));
  }

  private resolveRules(event: DomainEvent): DomainEventHandler[] {
    const matchedDomains = new Set<DomainType>();
    for (const rule of this.rules) {
      if (rule.sourceEventType === event.eventType) {
        matchedDomains.add(rule.targetDomain);
      }
    }
    return Array.from(matchedDomains).map(domain => ({
      domain,
      handle: async () => {},
    }));
  }

  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}
