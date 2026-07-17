export type EntityIdBrand = { readonly __brand: 'EntityId' };

export type EntityId = string & EntityIdBrand;

export function createEntityId(id: string): EntityId {
  return id as EntityId;
}
