import { describe, it, expect, beforeEach } from 'vitest';
import type { EntityId } from '@storynaram/core';
import { RepositoryRegistry } from '../src/repository/repository-registry';
import { MemoryRepository } from '../src/repository/memory-repository';
import { RepositoryConfigurationError } from '../src/repository/errors';

interface TestEntity {
  entityId: EntityId;
  name: string;
  value: number;
}

describe('RepositoryRegistry', () => {
  let registry: RepositoryRegistry;

  beforeEach(() => {
    registry = new RepositoryRegistry();
  });

  it('should register and resolve a repository', () => {
    const repo = new MemoryRepository<TestEntity>('character');
    registry.register('character', repo);
    const resolved = registry.resolve<TestEntity>('character');
    expect(resolved.entityType).toBe('character');
  });

  it('should throw when resolving unregistered type', () => {
    expect(() => registry.resolve('nonexistent')).toThrow(RepositoryConfigurationError);
  });

  it('should unregister a repository', () => {
    const repo = new MemoryRepository<TestEntity>('character');
    registry.register('character', repo);
    expect(registry.has('character')).toBe(true);
    registry.unregister('character');
    expect(registry.has('character')).toBe(false);
  });

  it('should list registered types', () => {
    registry.register('character', new MemoryRepository<TestEntity>('character'));
    registry.register('world', new MemoryRepository<TestEntity>('world'));
    const types = registry.list();
    expect(types).toContain('character');
    expect(types).toContain('world');
  });

  it('should return statistics', () => {
    registry.register('character', new MemoryRepository<TestEntity>('character'));
    registry.register('world', new MemoryRepository<TestEntity>('world'));
    const stats = registry.statistics();
    expect(stats.totalRepositories).toBe(2);
    expect(stats.repositoriesByType.character).toBe(1);
    expect(stats.repositoriesByType.world).toBe(1);
  });
});

describe('RepositoryRegistry with RepositoryFactory', () => {
  it('should create and register via factory', async () => {
    const registry = new RepositoryRegistry();
    const repo = new MemoryRepository<TestEntity>('item');
    registry.register('item', repo);
    const resolved = registry.resolve<TestEntity>('item');
    const result = await resolved.create({ entityId: crypto.randomUUID() as EntityId, name: 'sword', value: 100 });
    expect(result.success).toBe(true);
    expect(result.data!.name).toBe('sword');
  });
});
