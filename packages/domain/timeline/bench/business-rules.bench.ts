import { bench, describe } from 'vitest';
import {
  ChronologicalOrderRule,
  BranchConsistencyRule,
  CausalityValidationRule,
  CircularDependencyRule,
} from '../src/business-rules';
import { TimelineDate } from '../src/timeline-date';
import { TimelineEvents, TimelineEvent } from '../src/timeline-event';
import { TimelineBranches } from '../src/timeline-branch';

describe('Timeline BusinessRules benchmarks', () => {
  const events = new TimelineEvents(
    Array.from({ length: 100 }, (_, i) =>
      new TimelineEvent(`evt-${i}`, `Event ${i}`, '', new TimelineDate(2024, 1, i + 1), 'historical', 50, 'main')
    ),
  );
  const branches = new TimelineBranches([]);

  bench('chronological order check (first event)', () => {
    new ChronologicalOrderRule(new TimelineDate(2024, 6, 1), 'main', events).check();
  });

  bench('branch consistency check', () => {
    new BranchConsistencyRule('main', branches as any).check();
  });

  bench('causality validation', () => {
    new CausalityValidationRule(['evt-0'], new TimelineDate(2024, 6, 1), events).check();
  });

  bench('circular dependency detection', () => {
    new CircularDependencyRule('evt-50', ['evt-0'], events).check();
  });
});
