import { describe, it, expect } from 'vitest';
import {
  ChronologicalOrderRule,
  ValidDateRule,
  BranchConsistencyRule,
  CausalityValidationRule,
  CircularDependencyRule,
  ParentBranchRule,
  assertValidEventDate,
} from '../src/business-rules';
import { TimelineDate } from '../src/timeline-date';
import { TimelineEvents, TimelineEvent } from '../src/timeline-event';
import { TimelineBranches, TimelineBranch } from '../src/timeline-branch';

describe('BusinessRules', () => {
  it('ValidDateRule passes for valid date', () => {
    const rule = new ValidDateRule(new TimelineDate(2024, 1, 1));
    expect(rule.check()).toBeNull();
  });

  it('ChronologicalOrderRule passes for first event', () => {
    const events = new TimelineEvents();
    const rule = new ChronologicalOrderRule(new TimelineDate(2024, 1, 1), 'main', events);
    expect(rule.check()).toBeNull();
  });

  it('ChronologicalOrderRule fails for out-of-order event', () => {
    const events = new TimelineEvents([
      new TimelineEvent('evt-1', 'First', '', new TimelineDate(2024, 6, 1), 'historical', 50, 'main'),
    ]);
    const rule = new ChronologicalOrderRule(new TimelineDate(2024, 1, 1), 'main', events);
    expect(rule.check()).not.toBeNull();
  });

  it('BranchConsistencyRule passes for existing branch', () => {
    const branches = new TimelineBranches([]);
    const rule = new BranchConsistencyRule('main', branches as any);
    expect(rule.check()).toBeNull();
  });

  it('BranchConsistencyRule fails for non-existent branch', () => {
    const branches = new TimelineBranches([]);
    const rule = new BranchConsistencyRule('ghost', branches as any);
    expect(rule.check()).not.toBeNull();
  });

  it('CausalityValidationRule passes when cause before effect', () => {
    const events = new TimelineEvents([
      new TimelineEvent('cause', 'Cause', '', new TimelineDate(2024, 1, 1), 'historical', 50, 'main'),
    ]);
    const rule = new CausalityValidationRule(['cause'], new TimelineDate(2024, 6, 1), events);
    expect(rule.check()).toBeNull();
  });

  it('CausalityValidationRule warns when cause after effect', () => {
    const events = new TimelineEvents([
      new TimelineEvent('cause', 'Cause', '', new TimelineDate(2024, 12, 1), 'historical', 50, 'main'),
    ]);
    const rule = new CausalityValidationRule(['cause'], new TimelineDate(2024, 6, 1), events);
    expect(rule.check()).not.toBeNull();
  });

  it('CircularDependencyRule detects cycles', () => {
    const events = new TimelineEvents([
      new TimelineEvent('a', 'A', '', new TimelineDate(2024, 1, 1), 'historical', 50, 'main', [], ['b']),
      new TimelineEvent('b', 'B', '', new TimelineDate(2024, 6, 1), 'historical', 50, 'main', [], ['a']),
    ]);
    const rule = new CircularDependencyRule('a', ['b'], events);
    expect(rule.check()).not.toBeNull();
  });

  it('CircularDependencyRule passes for acyclic chain', () => {
    const events = new TimelineEvents([
      new TimelineEvent('a', 'A', '', new TimelineDate(2024, 1, 1), 'historical', 50, 'main', [], ['b']),
      new TimelineEvent('b', 'B', '', new TimelineDate(2024, 6, 1), 'historical', 50, 'main'),
    ]);
    const rule = new CircularDependencyRule('c', ['b'], events);
    expect(rule.check()).toBeNull();
  });

  it('ParentBranchRule passes for no parent', () => {
    const branches = new TimelineBranches([]);
    const rule = new ParentBranchRule(undefined, branches as any);
    expect(rule.check()).toBeNull();
  });

  it('ParentBranchRule fails for non-existent parent', () => {
    const branches = new TimelineBranches([]);
    const rule = new ParentBranchRule('ghost-parent', branches as any);
    expect(rule.check()).not.toBeNull();
  });

  it('assertValidEventDate does not throw for valid date', () => {
    expect(() => assertValidEventDate(new TimelineDate(2024, 1, 1))).not.toThrow();
  });
});
