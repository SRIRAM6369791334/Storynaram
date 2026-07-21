import { describe, it, expect } from 'vitest';
import { NarrativeTitle, Subtitle } from '../src/narrative-title';
import { Synopsis, Summary } from '../src/narrative-synopsis';
import { Genre, Audience, Language } from '../src/narrative-genre';
import { NarrativeStatus } from '../src/narrative-status';
import { ChapterNumber, SceneNumber, BeatNumber, DialogueOrder } from '../src/narrative-numbers';
import { WordCount, ReadingTime } from '../src/narrative-metrics';
import { NarrativeProfile } from '../src/narrative-profile';
import { NarrativeMetadata } from '../src/narrative-metadata';
import { NarrativeStatistics } from '../src/narrative-statistics';

describe('NarrativeTitle', () => {
  it('creates with value', () => {
    const t = new NarrativeTitle('The Hobbit');
    expect(t.value).toBe('The Hobbit');
  });

  it('throws on empty title', () => {
    expect(() => new NarrativeTitle('')).toThrow();
    expect(() => new NarrativeTitle('   ')).toThrow();
  });

  it('is equal case-insensitively', () => {
    const a = new NarrativeTitle('The Hobbit');
    const b = new NarrativeTitle('the hobbit');
    expect(a.equals(b)).toBe(true);
  });

  it('toJSON returns value', () => {
    const t = new NarrativeTitle('Test');
    expect(t.toJSON()).toEqual({ value: 'Test' });
  });
});

describe('Subtitle', () => {
  it('creates with value', () => {
    const s = new Subtitle('An Unexpected Journey');
    expect(s.value).toBe('An Unexpected Journey');
  });

  it('is equal case-insensitively', () => {
    const a = new Subtitle('Journey');
    const b = new Subtitle('journey');
    expect(a.equals(b)).toBe(true);
  });
});

describe('Synopsis', () => {
  it('creates with value', () => {
    const s = new Synopsis('A story about...');
    expect(s.value).toBe('A story about...');
  });

  it('equality compares by length', () => {
    const a = new Synopsis('abc');
    const b = new Synopsis('xyz');
    expect(a.equals(b)).toBe(true);
  });
});

describe('Summary', () => {
  it('creates with value', () => {
    const s = new Summary('Brief summary');
    expect(s.value).toBe('Brief summary');
  });

  it('equality compares by length', () => {
    const a = new Summary('ab');
    const b = new Summary('xy');
    expect(a.equals(b)).toBe(true);
  });
});

describe('Genre', () => {
  it('creates with value', () => {
    const g = new Genre('fantasy');
    expect(g.value).toBe('fantasy');
  });

  it('equality compares by value', () => {
    const a = new Genre('fantasy');
    const b = new Genre('scifi');
    expect(a.equals(b)).toBe(false);
  });
});

describe('Audience', () => {
  it('creates with audience type', () => {
    const a = new Audience('youngAdult');
    expect(a.value).toBe('youngAdult');
  });
});

describe('Language', () => {
  it('creates with language code', () => {
    const l = new Language('en');
    expect(l.value).toBe('en');
  });
});

describe('NarrativeStatus', () => {
  it('creates with status', () => {
    const s = new NarrativeStatus('outline');
    expect(s.value).toBe('outline');
  });

  it('isDraft returns true for draft states', () => {
    expect(new NarrativeStatus('idea').isDraft()).toBe(true);
    expect(new NarrativeStatus('outline').isDraft()).toBe(true);
    expect(new NarrativeStatus('firstDraft').isDraft()).toBe(true);
    expect(new NarrativeStatus('revision').isDraft()).toBe(false);
  });

  it('isCompleted returns true for completed', () => {
    expect(new NarrativeStatus('completed').isCompleted()).toBe(true);
    expect(new NarrativeStatus('published').isCompleted()).toBe(false);
  });

  it('isPublished returns true for published', () => {
    expect(new NarrativeStatus('published').isPublished()).toBe(true);
    expect(new NarrativeStatus('completed').isPublished()).toBe(false);
  });

  it('isArchived returns true for archived', () => {
    expect(new NarrativeStatus('archived').isArchived()).toBe(true);
    expect(new NarrativeStatus('published').isArchived()).toBe(false);
  });

  it('canTransitionTo allows valid transitions', () => {
    const s = new NarrativeStatus('idea');
    expect(s.canTransitionTo('outline')).toBe(true);
    expect(s.canTransitionTo('firstDraft')).toBe(true);
    expect(s.canTransitionTo('archived')).toBe(true);
    expect(s.canTransitionTo('revision')).toBe(false);
  });

  it('canTransitionTo rejects invalid transitions', () => {
    const s = new NarrativeStatus('archived');
    expect(s.canTransitionTo('firstDraft')).toBe(false);
  });
});

describe('ChapterNumber', () => {
  it('creates with number', () => {
    const n = new ChapterNumber(1);
    expect(n.value).toBe(1);
  });

  it('throws on number < 1', () => {
    expect(() => new ChapterNumber(0)).toThrow();
    expect(() => new ChapterNumber(-1)).toThrow();
  });

  it('formatted returns chapter prefix', () => {
    expect(new ChapterNumber(3).formatted).toBe('Chapter 3');
  });
});

describe('SceneNumber', () => {
  it('creates with number', () => {
    const n = new SceneNumber(1);
    expect(n.value).toBe(1);
  });

  it('throws on number < 1', () => {
    expect(() => new SceneNumber(0)).toThrow();
  });

  it('formatted returns scene prefix', () => {
    expect(new SceneNumber(2).formatted).toBe('Scene 2');
  });
});

describe('BeatNumber', () => {
  it('creates with number', () => {
    const n = new BeatNumber(1);
    expect(n.value).toBe(1);
  });

  it('throws on number < 1', () => {
    expect(() => new BeatNumber(0)).toThrow();
  });
});

describe('DialogueOrder', () => {
  it('creates with number', () => {
    const d = new DialogueOrder(1);
    expect(d.value).toBe(1);
  });

  it('throws on number < 1', () => {
    expect(() => new DialogueOrder(0)).toThrow();
  });
});

describe('WordCount', () => {
  it('creates with count', () => {
    const w = new WordCount(100);
    expect(w.value).toBe(100);
  });

  it('throws on negative count', () => {
    expect(() => new WordCount(-1)).toThrow();
  });

  it('add combines word counts', () => {
    const a = new WordCount(100);
    const b = new WordCount(200);
    expect(a.add(b).value).toBe(300);
  });

  it('zero returns 0', () => {
    expect(WordCount.zero().value).toBe(0);
  });
});

describe('ReadingTime', () => {
  it('calculates minutes from word count', () => {
    const wc = new WordCount(500);
    const rt = new ReadingTime(wc);
    expect(rt.minutes).toBe(2);
  });

  it('formatted shows minutes when < 60', () => {
    const rt = new ReadingTime(new WordCount(500));
    expect(rt.formatted).toBe('2m');
  });

  it('formatted shows hours only when minutes are multiple of 60', () => {
    const rt = new ReadingTime(new WordCount(30000));
    expect(rt.formatted).toBe('2h');
  });

  it('formatted shows hours and minutes when remainder exists', () => {
    const rt = new ReadingTime(new WordCount(30001));
    expect(rt.formatted).toMatch(/^\d+h \d+m$/);
  });
});

describe('NarrativeProfile', () => {
  it('creates with title and format', () => {
    const p = new NarrativeProfile(new NarrativeTitle('Test'), 'novel');
    expect(p.title.value).toBe('Test');
    expect(p.format).toBe('novel');
  });

  it('withStatus returns new profile with updated status', () => {
    const p = new NarrativeProfile(new NarrativeTitle('Test'), 'novel');
    const updated = p.withStatus(new NarrativeStatus('published'));
    expect(updated.status.value).toBe('published');
    expect(p.status.value).toBe('idea');
  });
});

describe('NarrativeMetadata', () => {
  it('creates with defaults', () => {
    const m = new NarrativeMetadata();
    expect(m.revision).toBe(0);
    expect(m.isStandalone).toBe(true);
    expect(m.createdAt).toBeDefined();
  });

  it('throws on negative revision', () => {
    expect(() => new NarrativeMetadata({ revision: -1 })).toThrow();
  });

  it('withUpdate increments revision and sets editor', () => {
    const m = new NarrativeMetadata();
    const updated = m.withUpdate('author-1');
    expect(updated.revision).toBe(1);
    expect(updated.lastEditedBy).toBe('author-1');
  });
});

describe('NarrativeStatistics', () => {
  it('creates with defaults', () => {
    const s = new NarrativeStatistics();
    expect(s.totalChapters).toBe(0);
    expect(s.totalWordCount).toBe(0);
  });

  it('throws on negative totalChapters', () => {
    expect(() => new NarrativeStatistics({ totalChapters: -1 })).toThrow();
  });
});
