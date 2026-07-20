import { ValueObject } from '@storynaram/domain-kernel';

export enum LifeStage {
  CHILD = 'CHILD',
  ADOLESCENT = 'ADOLESCENT',
  ADULT = 'ADULT',
  ELDERLY = 'ELDERLY',
}

export enum Consciousness {
  AWAKE = 'AWAKE',
  UNCONSCIOUS = 'UNCONSCIOUS',
  ASLEEP = 'ASLEEP',
  INCAPACITATED = 'INCAPACITATED',
}

export interface CharacterStatusProps {
  isAlive?: boolean;
  isPlayable?: boolean;
  lifeStage?: LifeStage;
  consciousness?: Consciousness;
}

export class CharacterStatus extends ValueObject {
  public readonly isAlive: boolean;
  public readonly isPlayable: boolean;
  public readonly lifeStage: LifeStage;
  public readonly consciousness: Consciousness;

  constructor(props: CharacterStatusProps = {}) {
    super();
    this.isAlive = props.isAlive ?? true;
    this.isPlayable = props.isPlayable ?? true;
    this.lifeStage = props.lifeStage ?? LifeStage.ADULT;
    this.consciousness = props.consciousness ?? Consciousness.AWAKE;
  }

  get isDead(): boolean {
    return !this.isAlive;
  }

  kill(): CharacterStatus {
    return new CharacterStatus({
      ...this,
      isAlive: false,
      consciousness: Consciousness.INCAPACITATED,
    });
  }

  revive(): CharacterStatus {
    return new CharacterStatus({
      ...this,
      isAlive: true,
      consciousness: Consciousness.AWAKE,
    });
  }

  setLifeStage(stage: LifeStage): CharacterStatus {
    return new CharacterStatus({ ...this, lifeStage: stage });
  }

  setConsciousness(state: Consciousness): CharacterStatus {
    return new CharacterStatus({ ...this, consciousness: state });
  }

  protected getEqualityComponents(): unknown[] {
    return [this.isAlive, this.isPlayable, this.lifeStage, this.consciousness];
  }

  toJSON(): Record<string, unknown> {
    return {
      isAlive: this.isAlive,
      isPlayable: this.isPlayable,
      lifeStage: this.lifeStage,
      consciousness: this.consciousness,
    };
  }
}
