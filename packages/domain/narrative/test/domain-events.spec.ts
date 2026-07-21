import { describe, it, expect } from 'vitest';
import {
  NarrativeCreatedEvent,
  ChapterAddedEvent,
  SceneAddedEvent,
  BeatAddedEvent,
  DialogueAddedEvent,
  NarrativePublishedEvent,
  NarrativeArchivedEvent,
} from '../src/narrative-events';

describe('NarrativeCreatedEvent', () => {
  it('creates with payload', () => {
    const event = new NarrativeCreatedEvent('narrative-1', { title: 'My Story', format: 'novel' });
    expect(event.eventType).toBe('narrative.created');
    expect(event.aggregateId).toBe('narrative-1');
    expect(event.payload.title).toBe('My Story');
    expect(event.payload.format).toBe('novel');
  });
});

describe('ChapterAddedEvent', () => {
  it('creates with event info', () => {
    const event = new ChapterAddedEvent('narrative-1', { chapterId: 'ch-1', title: 'Chapter One', chapterNumber: 1 });
    expect(event.eventType).toBe('narrative.chapter.added');
    expect(event.payload.chapterId).toBe('ch-1');
    expect(event.payload.chapterNumber).toBe(1);
  });
});

describe('SceneAddedEvent', () => {
  it('creates with event info', () => {
    const event = new SceneAddedEvent('narrative-1', { sceneId: 'sc-1', chapterId: 'ch-1', sceneNumber: 1, title: 'Scene One' });
    expect(event.eventType).toBe('narrative.scene.added');
    expect(event.payload.sceneId).toBe('sc-1');
    expect(event.payload.chapterId).toBe('ch-1');
    expect(event.payload.sceneNumber).toBe(1);
  });
});

describe('BeatAddedEvent', () => {
  it('creates with event info', () => {
    const event = new BeatAddedEvent('narrative-1', { beatId: 'bt-1', sceneId: 'sc-1', beatNumber: 1, beatType: 'setup' });
    expect(event.eventType).toBe('narrative.beat.added');
    expect(event.payload.beatId).toBe('bt-1');
    expect(event.payload.beatType).toBe('setup');
  });
});

describe('DialogueAddedEvent', () => {
  it('creates with event info', () => {
    const event = new DialogueAddedEvent('narrative-1', { dialogueId: 'dg-1', beatId: 'bt-1', order: 1, speaker: 'Narrator' });
    expect(event.eventType).toBe('narrative.dialogue.added');
    expect(event.payload.dialogueId).toBe('dg-1');
    expect(event.payload.speaker).toBe('Narrator');
  });
});

describe('NarrativePublishedEvent', () => {
  it('creates with payload', () => {
    const event = new NarrativePublishedEvent('narrative-1', { title: 'My Story' });
    expect(event.eventType).toBe('narrative.published');
    expect(event.aggregateId).toBe('narrative-1');
    expect(event.payload.title).toBe('My Story');
  });
});

describe('NarrativeArchivedEvent', () => {
  it('creates with payload', () => {
    const event = new NarrativeArchivedEvent('narrative-1', { title: 'My Story' });
    expect(event.eventType).toBe('narrative.archived');
    expect(event.aggregateId).toBe('narrative-1');
    expect(event.payload.title).toBe('My Story');
  });
});
