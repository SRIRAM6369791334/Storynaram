import { describe, it, expect } from 'vitest';
import { StoryIdentity } from '../src/story-identity';
import { StoryProfile } from '../src/story-profile';
import { StoryMetadata } from '../src/story-metadata';
import { StoryStatistics } from '../src/story-statistics';
import { StoryState } from '../src/story-state';
import { StoryVersion } from '../src/story-version';

describe('StoryIdentity', () => {
  it('creates with value', () => {
    const id = new StoryIdentity('story-1');
    expect(id.value).toBe('story-1');
  });

  it('creates with random UUID', () => {
    const id = StoryIdentity.create();
    expect(id.value).toBeDefined();
  });
});

describe('StoryProfile', () => {
  it('creates with required title', () => {
    const p = new StoryProfile('My Story');
    expect(p.title).toBe('My Story');
    expect(p.format).toBe('novel');
  });

  it('throws on empty title', () => {
    expect(() => new StoryProfile('')).toThrow();
  });

  it('withStatus returns new profile', () => {
    const p = new StoryProfile('Test');
    const updated = p.withStatus('completed');
    expect(updated.status).toBe('completed');
    expect(p.status).toBe('draft');
  });
});

describe('StoryMetadata', () => {
  it('creates with defaults', () => {
    const m = new StoryMetadata();
    expect(m.revision).toBe(0);
  });

  it('throws on negative revision', () => {
    expect(() => new StoryMetadata({ revision: -1 })).toThrow();
  });

  it('withUpdate increments revision', () => {
    const m = new StoryMetadata();
    const updated = m.withUpdate('author');
    expect(updated.revision).toBe(1);
  });
});

describe('StoryStatistics', () => {
  it('creates with defaults', () => {
    const s = new StoryStatistics();
    expect(s.totalPlotPoints).toBe(0);
  });

  it('throws on negative totalPlotPoints', () => {
    expect(() => new StoryStatistics({ totalPlotPoints: -1 })).toThrow();
  });
});

describe('StoryState', () => {
  it('creates with default phase', () => {
    const s = new StoryState();
    expect(s.phase).toBe('concept');
  });

  it('markComplete sets isComplete', () => {
    const s = new StoryState().markComplete();
    expect(s.isComplete).toBe(true);
  });

  it('markPublished sets isPublished', () => {
    const s = new StoryState().markPublished();
    expect(s.isPublished).toBe(true);
  });

  it('markArchived sets isArchived', () => {
    const s = new StoryState().markArchived();
    expect(s.isArchived).toBe(true);
  });
});

describe('StoryVersion', () => {
  it('creates with defaults', () => {
    const v = new StoryVersion();
    expect(v.label).toBe('v1.0.0');
  });

  it('throws on negative version numbers', () => {
    expect(() => new StoryVersion(-1, 0, 0)).toThrow();
    expect(() => new StoryVersion(0, -1, 0)).toThrow();
    expect(() => new StoryVersion(0, 0, -1)).toThrow();
  });

  it('bumpMajor increments major', () => {
    const v = new StoryVersion().bumpMajor();
    expect(v.major).toBe(2);
    expect(v.minor).toBe(0);
  });
});
