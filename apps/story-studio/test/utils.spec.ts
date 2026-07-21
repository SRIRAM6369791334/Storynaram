import { describe, it, expect } from 'vitest';
import { cn } from '../src/utils/cn';
import { formatDate, truncate, pluralize } from '../src/utils/format';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden')).toBe('base');
  });

  it('merges tailwind conflicts', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2026-01-15');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('keeps short strings', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });
});

describe('pluralize', () => {
  it('returns singular for 1', () => {
    expect(pluralize(1, 'story')).toBe('story');
  });

  it('returns plural for 0 with explicit plural', () => {
    expect(pluralize(0, 'story', 'stories')).toBe('stories');
  });

  it('returns plural for >1 with explicit plural', () => {
    expect(pluralize(3, 'story', 'stories')).toBe('stories');
  });

  it('falls back to +s for regular words', () => {
    expect(pluralize(2, 'word')).toBe('words');
  });
});
