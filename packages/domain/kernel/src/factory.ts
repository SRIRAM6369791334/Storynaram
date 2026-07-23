import { FactoryError } from './errors.js';

export abstract class Factory<T, TProps = unknown> {
  abstract create(props: TProps): T;

  abstract reconstitute(state: Record<string, unknown>): T;

  protected assertValid(condition: boolean, message: string): void {
    if (!condition) {
      throw new FactoryError(message);
    }
  }
}
