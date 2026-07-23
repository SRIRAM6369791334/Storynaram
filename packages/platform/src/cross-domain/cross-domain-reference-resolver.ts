import { IntegrationRegistry, DomainType } from '../integration-registry.js';

export interface ResolvedReference {
  domain: DomainType;
  entityId: string;
  exists: boolean;
  entityType: string;
  label: string;
}

export interface ReferenceDescriptor {
  domain: DomainType;
  entityId: string;
  entityType: string;
}

export class CrossDomainReferenceResolver {
  private readonly resolvers = new Map<string, (id: string) => Promise<{ exists: boolean; label: string }>>();

  constructor(private readonly registry: IntegrationRegistry) {}

  registerResolver(
    domain: DomainType,
    entityType: string,
    resolver: (id: string) => Promise<{ exists: boolean; label: string }>,
  ): void {
    const key = `${domain}:${entityType}`;
    this.resolvers.set(key, resolver);
  }

  async resolve(ref: ReferenceDescriptor): Promise<ResolvedReference> {
    const key = `${ref.domain}:${ref.entityType}`;
    const resolver = this.resolvers.get(key);
    if (!resolver) {
      return { ...ref, exists: false, label: `No resolver for ${key}` };
    }
    try {
      const result = await resolver(ref.entityId);
      return { ...ref, ...result };
    } catch {
      return { ...ref, exists: false, label: `Error resolving ${ref.entityId}` };
    }
  }

  async resolveMany(refs: ReferenceDescriptor[]): Promise<ResolvedReference[]> {
    return Promise.all(refs.map(r => this.resolve(r)));
  }

  hasResolver(domain: DomainType, entityType: string): boolean {
    return this.resolvers.has(`${domain}:${entityType}`);
  }

  getRegisteredResolvers(): string[] {
    return Array.from(this.resolvers.keys());
  }
}
