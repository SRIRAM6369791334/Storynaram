import { describe, it, expect } from 'vitest';
import { NarrativeAggregate } from '../src/narrative-aggregate';
import { NarrativeIdentity } from '../src/narrative-identity';
import { NarrativeProfile } from '../src/narrative-profile';
import { NarrativeTitle } from '../src/narrative-title';

describe('NarrativeAggregate', () => {
  it('creates with identity', () => {
    const n = new NarrativeAggregate(NarrativeIdentity.create());
    expect(n.identity).toBeDefined();
  });

  it('initializes with title and format', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('The Hobbit', 'novel');
    expect(n.profile.title.value).toBe('The Hobbit');
    expect(n.profile.format).toBe('novel');
  });

  it('emits created event on initialize', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    expect(n.domainEvents.some(e => e.eventType === 'narrative.created')).toBe(true);
  });

  it('updateProfile replaces profile', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    const newProfile = new NarrativeProfile(new NarrativeTitle('Updated'), 'screenplay');
    n.updateProfile(newProfile);
    expect(n.profile.title.value).toBe('Updated');
    expect(n.profile.format).toBe('screenplay');
  });

  it('addChapter adds chapter and emits event', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    n.addChapter('ch-1', 'Chapter One', 1);
    expect(n.chapters.count).toBe(1);
    expect(n.chapters.get('ch-1')?.title).toBe('Chapter One');
    expect(n.domainEvents.some(e => e.eventType === 'narrative.chapter.added')).toBe(true);
  });

  it('addChapter validates sequential numbering', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    n.addChapter('ch-1', 'Chapter One', 1);
    expect(() => n.addChapter('ch-2', 'Jump', 3)).toThrow();
  });

  it('addChapter rejects duplicate chapter number', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    n.addChapter('ch-1', 'Chapter One', 1);
    expect(() => n.addChapter('ch-2', 'Duplicate', 1)).toThrow();
  });

  it('addScene adds scene and emits event', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    n.addChapter('ch-1', 'Chapter One', 1);
    n.addScene('sc-1', 'ch-1', 1, 'Scene One', 'opening');
    expect(n.scenes.count).toBe(1);
    expect(n.scenes.get('sc-1')?.title).toBe('Scene One');
    expect(n.domainEvents.some(e => e.eventType === 'narrative.scene.added')).toBe(true);
  });

  it('addScene rejects missing chapter', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    expect(() => n.addScene('sc-1', 'ghost', 1)).toThrow();
  });

  it('addScene rejects duplicate scene number in same chapter', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    n.addChapter('ch-1', 'Chapter One', 1);
    n.addScene('sc-1', 'ch-1', 1, 'Scene One');
    expect(() => n.addScene('sc-2', 'ch-1', 1, 'Another')).toThrow();
  });

  it('addBeat adds beat and emits event', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    n.addChapter('ch-1', 'Ch1', 1);
    n.addScene('sc-1', 'ch-1', 1, 'Scene One');
    n.addBeat('bt-1', 'sc-1', 1, 'setup', 'Content');
    expect(n.beats.count).toBe(1);
    expect(n.beats.get('bt-1')?.beatType).toBe('setup');
    expect(n.domainEvents.some(e => e.eventType === 'narrative.beat.added')).toBe(true);
  });

  it('addBeat rejects missing scene', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    expect(() => n.addBeat('bt-1', 'ghost', 1, 'action')).toThrow();
  });

  it('addBeat rejects duplicate beat number in same scene', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    n.addChapter('ch-1', 'Ch1', 1);
    n.addScene('sc-1', 'ch-1', 1);
    n.addBeat('bt-1', 'sc-1', 1, 'setup');
    expect(() => n.addBeat('bt-2', 'sc-1', 1, 'action')).toThrow();
  });

  it('addDialogue adds dialogue and emits event', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    n.addChapter('ch-1', 'Ch1', 1);
    n.addScene('sc-1', 'ch-1', 1);
    n.addBeat('bt-1', 'sc-1', 1, 'setup');
    n.addDialogue('dg-1', 'bt-1', 1, 'Narrator', 'Once upon a time');
    expect(n.dialogues.count).toBe(1);
    expect(n.dialogues.get('dg-1')?.speaker).toBe('Narrator');
    expect(n.domainEvents.some(e => e.eventType === 'narrative.dialogue.added')).toBe(true);
  });

  it('addDialogue rejects missing beat', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    expect(() => n.addDialogue('dg-1', 'ghost', 1, 'Speaker', 'text')).toThrow();
  });

  it('addDialogue rejects duplicate order in same beat', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    n.addChapter('ch-1', 'Ch1', 1);
    n.addScene('sc-1', 'ch-1', 1);
    n.addBeat('bt-1', 'sc-1', 1, 'setup');
    n.addDialogue('dg-1', 'bt-1', 1, 'A', 'Hello');
    expect(() => n.addDialogue('dg-2', 'bt-1', 1, 'B', 'Hi')).toThrow();
  });

  it('publish changes status and emits event', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    n.publish();
    expect(n.profile.status.value).toBe('published');
    expect(n.domainEvents.some(e => e.eventType === 'narrative.published')).toBe(true);
  });

  it('archive changes status and emits event', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    n.archive();
    expect(n.profile.status.value).toBe('archived');
    expect(n.domainEvents.some(e => e.eventType === 'narrative.archived')).toBe(true);
  });

  it('scenesOfChapter returns scenes for a chapter', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    n.addChapter('ch-1', 'Ch1', 1);
    n.addChapter('ch-2', 'Ch2', 2);
    n.addScene('sc-1', 'ch-1', 1);
    n.addScene('sc-2', 'ch-1', 2);
    n.addScene('sc-3', 'ch-2', 1);
    expect(n.scenesOfChapter('ch-1')).toHaveLength(2);
  });

  it('beatsOfScene returns beats for a scene', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    n.addChapter('ch-1', 'Ch1', 1);
    n.addScene('sc-1', 'ch-1', 1);
    n.addScene('sc-2', 'ch-1', 2);
    n.addBeat('bt-1', 'sc-1', 1, 'setup');
    n.addBeat('bt-2', 'sc-1', 2, 'action');
    n.addBeat('bt-3', 'sc-2', 1, 'resolution');
    expect(n.beatsOfScene('sc-1')).toHaveLength(2);
  });

  it('dialoguesOfBeat returns dialogues for a beat', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    n.addChapter('ch-1', 'Ch1', 1);
    n.addScene('sc-1', 'ch-1', 1);
    n.addBeat('bt-1', 'sc-1', 1, 'setup');
    n.addBeat('bt-2', 'sc-1', 2, 'action');
    n.addDialogue('dg-1', 'bt-1', 1, 'A', 'Hi');
    n.addDialogue('dg-2', 'bt-1', 2, 'B', 'Hello');
    expect(n.dialoguesOfBeat('bt-1')).toHaveLength(2);
  });

  it('statistics update after adding elements', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    n.addChapter('ch-1', 'Ch1', 1);
    n.addScene('sc-1', 'ch-1', 1);
    n.addBeat('bt-1', 'sc-1', 1, 'setup');
    n.addDialogue('dg-1', 'bt-1', 1, 'A', 'Hello');
    expect(n.statistics.totalChapters).toBe(1);
    expect(n.statistics.totalScenes).toBe(1);
    expect(n.statistics.totalBeats).toBe(1);
    expect(n.statistics.totalDialogues).toBe(1);
  });

  it('version increments on changes', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    const v1 = n.version.value;
    n.addChapter('ch-1', 'Ch1', 1);
    expect(n.version.value).toBe(v1 + 1);
  });

  it('toJSON returns serializable structure', () => {
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    const json = n.toJSON();
    expect(json.identity).toBe('1');
    expect(json.profile).toBeDefined();
    expect(json.chapters).toBeDefined();
    expect(json.scenes).toBeDefined();
    expect(json.beats).toBeDefined();
    expect(json.dialogues).toBeDefined();
    expect(json.metadata).toBeDefined();
    expect(json.statistics).toBeDefined();
  });
});
