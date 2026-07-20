import { ValueObject } from '@storynaram/domain-kernel';

export interface WorldStatisticsProps {
  regionCount?: number;
  kingdomCount?: number;
  nationCount?: number;
  cityCount?: number;
  villageCount?: number;
  landmarkCount?: number;
  factionCount?: number;
  cultureCount?: number;
  languageCount?: number;
  totalPopulation?: number;
}

export class WorldStatistics extends ValueObject {
  public readonly regionCount: number;
  public readonly kingdomCount: number;
  public readonly nationCount: number;
  public readonly cityCount: number;
  public readonly villageCount: number;
  public readonly landmarkCount: number;
  public readonly factionCount: number;
  public readonly cultureCount: number;
  public readonly languageCount: number;

  constructor(props: WorldStatisticsProps = {}) {
    super();
    this.regionCount = props.regionCount ?? 0;
    this.kingdomCount = props.kingdomCount ?? 0;
    this.nationCount = props.nationCount ?? 0;
    this.cityCount = props.cityCount ?? 0;
    this.villageCount = props.villageCount ?? 0;
    this.landmarkCount = props.landmarkCount ?? 0;
    this.factionCount = props.factionCount ?? 0;
    this.cultureCount = props.cultureCount ?? 0;
    this.languageCount = props.languageCount ?? 0;

    if (this.regionCount < 0) throw new Error('Region count cannot be negative');
    if (this.kingdomCount < 0) throw new Error('Kingdom count cannot be negative');
    if (this.nationCount < 0) throw new Error('Nation count cannot be negative');
  }

  get totalSettlements(): number {
    return this.cityCount + this.villageCount;
  }

  protected getEqualityComponents(): unknown[] {
    return [this.regionCount, this.kingdomCount, this.nationCount, this.cityCount, this.villageCount, this.landmarkCount, this.factionCount, this.cultureCount, this.languageCount];
  }

  toJSON(): Record<string, unknown> {
    return {
      regionCount: this.regionCount,
      kingdomCount: this.kingdomCount,
      nationCount: this.nationCount,
      cityCount: this.cityCount,
      villageCount: this.villageCount,
      landmarkCount: this.landmarkCount,
      factionCount: this.factionCount,
      cultureCount: this.cultureCount,
      languageCount: this.languageCount,
    };
  }
}
