import { Factory, FactoryError } from '@storynaram/domain-kernel';
import { CanonAggregate } from './canon-aggregate.js';
import { CanonIdentity } from './canon-identity.js';
import { FactType } from './canon-fact.js';
import { CanonReference } from './canon-reference.js';
import { CanonRule } from './canon-rule.js';

export interface CreateCanonEntryInput {
  entryId?: string;
  factType: FactType;
  key: string;
  value: unknown;
  references?: CanonReference[];
  tags?: string[];
  confidence?: number;
}

export interface CreateCanonProps {
  identity?: string;
  name: string;
  description?: string;
  initialEntries?: CreateCanonEntryInput[];
  rules?: CanonRule[];
}

export class CanonFactory extends Factory<CanonAggregate, CreateCanonProps> {
  create(props: CreateCanonProps): CanonAggregate {
    this.assertValid(props.name.length > 0, 'Canon name is required');

    const identity = props.identity
      ? new CanonIdentity(props.identity)
      : CanonIdentity.create();

    const canon = new CanonAggregate(identity);
    canon.initialize(props.name, props.description ?? '');

    if (props.rules) {
      for (const rule of props.rules) {
        canon.addRule(rule);
      }
    }

    if (props.initialEntries) {
      for (const entryInput of props.initialEntries) {
        canon.addEntry(
          entryInput.entryId ?? `entry-${crypto.randomUUID()}`,
          entryInput.factType,
          entryInput.key,
          entryInput.value,
          entryInput.references,
          entryInput.tags,
          entryInput.confidence,
        );
      }
    }

    return canon;
  }

  reconstitute(state: Record<string, unknown>): CanonAggregate {
    const identity = new CanonIdentity(state.identity as string);
    const canon = new CanonAggregate(identity);
    canon.initialize(
      state.name as string,
      state.description as string,
    );
    return canon;
  }
}
