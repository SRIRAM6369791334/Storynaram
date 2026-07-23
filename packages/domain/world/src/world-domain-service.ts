import { DomainService, Specification } from '@storynaram/domain-kernel';
import { WorldAggregate } from './world-aggregate.js';
import { WorldIdentity } from './world-identity.js';
import { WorldRepositoryContract } from './world-repository.js';
import { Region } from './world-political.js';
import { FantasySpecification, SciFiSpecification, HistoricalSpecification, ModernSpecification, PostApocalypticSpecification, OpenWorldSpecification, SandboxSpecification } from './world-specifications.js';

export class WorldDomainService extends DomainService {
  constructor(
    private readonly repository: WorldRepositoryContract,
  ) {
    super('WorldDomainService');
  }

  async findByName(name: string): Promise<WorldAggregate[]> {
    return this.repository.findByName(name);
  }

  async findByGenre(genre: string): Promise<WorldAggregate[]> {
    return this.repository.findByGenre(genre);
  }

  async findFantasyWorlds(): Promise<WorldAggregate[]> {
    const all = await this.repository.findAll();
    const spec = new FantasySpecification();
    return all.filter(w => spec.isSatisfiedBy(w));
  }

  async findSciFiWorlds(): Promise<WorldAggregate[]> {
    const all = await this.repository.findAll();
    const spec = new SciFiSpecification();
    return all.filter(w => spec.isSatisfiedBy(w));
  }

  async findPostApocalypticWorlds(): Promise<WorldAggregate[]> {
    const all = await this.repository.findAll();
    const spec = new PostApocalypticSpecification();
    return all.filter(w => spec.isSatisfiedBy(w));
  }

  async findWorldsBySpecification(spec: Specification<WorldAggregate>): Promise<WorldAggregate[]> {
    const all = await this.repository.findAll();
    return all.filter(w => spec.isSatisfiedBy(w));
  }

  async getRegionClusters(worldId: string): Promise<{
    world: WorldAggregate | null;
    rootRegions: Region[];
  }> {
    const identity = new WorldIdentity(worldId);
    const world = await this.repository.findByIdentity(identity);
    if (!world) {
      return { world: null, rootRegions: [] };
    }
    return { world, rootRegions: world.map.rootRegions() };
  }
}
