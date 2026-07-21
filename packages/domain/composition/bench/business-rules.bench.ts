import { bench, describe } from 'vitest';
import {
  ThreeActStructureRule, FiveActStructureRule,
  ConflictConsistencyRule,
} from '../src/business-rules';

describe('Composition BusinessRules benchmarks', () => {
  bench('three act structure check', () => {
    new ThreeActStructureRule('threeAct', 5).check();
  });

  bench('five act structure check', () => {
    new FiveActStructureRule('fiveAct', 7).check();
  });

  bench('conflict consistency check', () => {
    new ConflictConsistencyRule('characterVsCharacter', true).check();
  });
});
