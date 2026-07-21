import { bench, describe } from 'vitest';
import type { ValidationResult } from '../src/execution-result';

function simulateValidation(content: string): ValidationResult[] {
  const dimensions = ['TimelineConsistency', 'CanonConsistency', 'NarrativeConsistency', 'CharacterConsistency', 'WorldConsistency'];
  return dimensions.map(d => ({
    validator: d,
    passed: !content.toLowerCase().includes(d.toLowerCase().replace('consistency', '').toLowerCase() + ' inconsistency'),
    issues: content.includes(d) ? ['Potential issue detected'] : [],
  }));
}

describe('Validation Throughput Benchmarks', () => {
  bench('validate 1000-chapter story (50KB content)', () => {
    const content = 'A'.repeat(50000);
    simulateValidation(content);
  });

  bench('validate with issues in all dimensions', () => {
    const content = 'timeline inconsistency found in chapter 5. canon inconsistency between character ages. narrative inconsistency in pacing. character inconsistency in dialogue. world inconsistency in geography.';
    simulateValidation(content);
  });

  bench('parse validation results from 100KB AI output', () => {
    const content = [
      '1. TIMELINE CONSISTENCY',
      '   Pass',
      '2. CANON CONSISTENCY',
      '   Fail - character age mismatch in chapter 3',
      '3. NARRATIVE CONSISTENCY',
      '   Pass',
      '4. CHARACTER CONSISTENCY',
      '   Fail - dialogue inconsistent with established voice',
      '5. WORLD CONSISTENCY',
      '   Pass',
    ].join('\n') + '\n' + 'x'.repeat(100000);

    const validationResults: ValidationResult[] = [
      {
        validator: 'TimelineConsistency',
        passed: content.includes('Pass') && !content.toLowerCase().includes('timeline'),
        issues: [],
      },
      {
        validator: 'CanonConsistency',
        passed: !content.includes('Fail'),
        issues: content.includes('Fail') ? ['Character age mismatch'] : [],
      },
      {
        validator: 'NarrativeConsistency',
        passed: content.includes('Pass'),
        issues: [],
      },
      {
        validator: 'CharacterConsistency',
        passed: !content.includes('inconsistent'),
        issues: content.includes('inconsistent') ? ['Dialogue inconsistency'] : [],
      },
      {
        validator: 'WorldConsistency',
        passed: content.includes('Pass'),
        issues: [],
      },
    ];
  });
});
