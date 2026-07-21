export type DomainType =
  | 'character' | 'world' | 'timeline' | 'canon' | 'narrative' | 'composition';

export interface DomainRegistration {
  domain: DomainType;
  name: string;
  version: string;
  repository: unknown;
  dependencies: DomainType[];
  events: string[];
}

export class IntegrationRegistry {
  private readonly registrations = new Map<DomainType, DomainRegistration>();

  register(registration: DomainRegistration): void {
    if (this.registrations.has(registration.domain)) {
      throw new Error(`Domain already registered: ${registration.domain}`);
    }
    this.registrations.set(registration.domain, registration);
  }

  get(domain: DomainType): DomainRegistration {
    const r = this.registrations.get(domain);
    if (!r) throw new Error(`Domain not registered: ${domain}`);
    return r;
  }

  getAll(): DomainRegistration[] {
    return Array.from(this.registrations.values());
  }

  isRegistered(domain: DomainType): boolean {
    return this.registrations.has(domain);
  }

  getDependencies(domain: DomainType): DomainType[] {
    return this.get(domain).dependencies;
  }

  getEvents(domain: DomainType): string[] {
    return this.get(domain).events;
  }

  hasEvent(domain: DomainType, eventType: string): boolean {
    return this.get(domain).events.includes(eventType);
  }

  findDomainsForEvent(eventType: string): DomainType[] {
    return this.getAll()
      .filter(r => r.events.includes(eventType))
      .map(r => r.domain);
  }

  getDomainCount(): number {
    return this.registrations.size;
  }

  clear(): void {
    this.registrations.clear();
  }
}
