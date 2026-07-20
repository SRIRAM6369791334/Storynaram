import { describe, it, expect } from 'vitest';
import { Entity } from '../src/entity';
import { Identity } from '../src/identity';
import { DomainVersion } from '../src/domain-version';

class TestEntity extends Entity<Identity<string>> {
  constructor(
    id: string,
    public label: string,
  ) {
    super(new Identity(id));
  }

  updateLabel(label: string): void {
    this.label = label;
    this.markUpdated();
  }
}

describe('Entity', () => {
  it('creates with identity', () => {
    const entity = new TestEntity('1', 'test');
    expect(entity.identity.value).toBe('1');
    expect(entity.label).toBe('test');
  });

  it('initial version is 1', () => {
    const entity = new TestEntity('1', 'test');
    expect(entity.version.equals(DomainVersion.initial())).toBe(true);
  });

  it('equals by identity', () => {
    const a = new TestEntity('1', 'foo');
    const b = new TestEntity('1', 'bar');
    expect(a.equals(b)).toBe(true);
  });

  it('not equals different identity', () => {
    const a = new TestEntity('1', 'foo');
    const b = new TestEntity('2', 'foo');
    expect(a.equals(b)).toBe(false);
  });

  it('not equals null', () => {
    const a = new TestEntity('1', 'test');
    expect(a.equals(null as unknown as TestEntity)).toBe(false);
  });

  it('version increments on update', () => {
    const entity = new TestEntity('1', 'test');
    const v1 = entity.version.value;
    entity.updateLabel('updated');
    expect(entity.version.value).toBe(v1 + 1);
  });

  it('soft delete sets deletedAt', () => {
    const entity = new TestEntity('1', 'test');
    entity.delete();
    expect(entity.isDeleted()).toBe(true);
    expect(entity.deletedAt).not.toBeNull();
  });

  it('restore clears deletedAt', () => {
    const entity = new TestEntity('1', 'test');
    entity.delete();
    entity.restore();
    expect(entity.isDeleted()).toBe(false);
    expect(entity.deletedAt).toBeNull();
  });

  it('toJSON returns serialized state', () => {
    const entity = new TestEntity('1', 'test');
    const json = entity.toJSON();
    expect(json.identity).toBe('1');
    expect(json.version).toBe(1);
    expect(json.deletedAt).toBeNull();
  });
});
