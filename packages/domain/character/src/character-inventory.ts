import { ValueObject } from '@storynaram/domain-kernel';

export class InventoryItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public quantity: number = 1,
    public readonly weight: number = 0,
    public isEquipped: boolean = false,
  ) {
    if (quantity < 0) throw new Error(`Item quantity cannot be negative: ${quantity}`);
    if (weight < 0) throw new Error(`Item weight cannot be negative: ${weight}`);
  }

  equip(): void {
    this.isEquipped = true;
  }

  unequip(): void {
    this.isEquipped = false;
  }

  addQuantity(amount: number): void {
    this.quantity += amount;
  }

  removeQuantity(amount: number): void {
    this.quantity = Math.max(0, this.quantity - amount);
  }
}

export class CharacterInventory extends ValueObject {
  private readonly items: Map<string, InventoryItem>;

  constructor(items: InventoryItem[] = []) {
    super();
    this.items = new Map();
    for (const item of items) {
      this.items.set(item.id, item);
    }
  }

  get all(): readonly InventoryItem[] {
    return Array.from(this.items.values());
  }

  get equipped(): InventoryItem[] {
    return this.all.filter(i => i.isEquipped);
  }

  get totalWeight(): number {
    return this.all.reduce((sum, i) => sum + i.weight * i.quantity, 0);
  }

  get count(): number {
    return this.items.size;
  }

  get(id: string): InventoryItem | undefined {
    return this.items.get(id);
  }

  add(item: InventoryItem): CharacterInventory {
    const next = new Map(this.items);
    const existing = next.get(item.id);
    if (existing) {
      existing.addQuantity(item.quantity);
    } else {
      next.set(item.id, item);
    }
    return new CharacterInventory(Array.from(next.values()));
  }

  remove(id: string, quantity: number = 1): CharacterInventory {
    const next = new Map(this.items);
    const existing = next.get(id);
    if (existing) {
      existing.removeQuantity(quantity);
      if (existing.quantity <= 0) {
        next.delete(id);
      }
    }
    return new CharacterInventory(Array.from(next.values()));
  }

  protected getEqualityComponents(): unknown[] {
    return [this.all.length];
  }

  toJSON(): Record<string, unknown>[] {
    return this.all.map(i => ({
      id: i.id,
      name: i.name,
      description: i.description,
      quantity: i.quantity,
      weight: i.weight,
      isEquipped: i.isEquipped,
    }));
  }
}
