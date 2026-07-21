import { describe, it, expect } from 'vitest';
import { NarrativeFactory } from '../src/narrative-factory';
import { FactoryError } from '@storynaram/domain-kernel';

const factory = new NarrativeFactory();

describe('NarrativeFactory', () => {
  it('creates a narrative with required props', () => {
    const n = factory.create({ title: 'My Story' });
    expect(n.identity).toBeDefined();
    expect(n.profile.title.value).toBe('My Story');
    expect(n.profile.format).toBe('novel');
    expect(n.chapters.count).toBe(0);
  });

  it('rejects empty title', () => {
    expect(() => factory.create({ title: '' })).toThrow(FactoryError);
  });

  it('uses provided identity', () => {
    const n = factory.create({ identity: 'my-narrative', title: 'Named' });
    expect(n.identity.value).toBe('my-narrative');
  });

  it('creates with specified format', () => {
    const n = factory.create({ title: 'Screenplay', format: 'screenplay' });
    expect(n.profile.format).toBe('screenplay');
  });

  it('creates with initial chapters', () => {
    const n = factory.create({
      title: 'With Chapters',
      initialChapters: [
        { title: 'Chapter One', chapterNumber: 1 },
        { title: 'Chapter Two', chapterNumber: 2 },
      ],
    });
    expect(n.chapters.count).toBe(2);
    expect(n.chapters.sorted()[0]?.title).toBe('Chapter One');
  });

  it('creates with initial scenes', () => {
    const n = factory.create({
      title: 'With Scenes',
      initialChapters: [{ chapterId: 'ch-1', title: 'Ch1', chapterNumber: 1 }],
      initialScenes: [
        { chapterId: 'ch-1', sceneNumber: 1, title: 'Scene One', sceneType: 'opening' },
      ],
    });
    expect(n.scenes.count).toBe(1);
    expect(n.scenes.sorted()[0]?.title).toBe('Scene One');
  });

  it('creates with initial beats', () => {
    const n = factory.create({
      title: 'With Beats',
      initialChapters: [{ chapterId: 'ch-1', title: 'Ch1', chapterNumber: 1 }],
      initialScenes: [{ sceneId: 'sc-1', chapterId: 'ch-1', sceneNumber: 1 }],
      initialBeats: [
        { sceneId: 'sc-1', beatNumber: 1, beatType: 'setup', content: 'Intro' },
      ],
    });
    expect(n.beats.count).toBe(1);
    expect(n.beats.sorted()[0]?.beatType).toBe('setup');
  });

  it('creates with initial dialogues', () => {
    const n = factory.create({
      title: 'With Dialogues',
      initialChapters: [{ chapterId: 'ch-1', title: 'Ch1', chapterNumber: 1 }],
      initialScenes: [{ sceneId: 'sc-1', chapterId: 'ch-1', sceneNumber: 1 }],
      initialBeats: [{ beatId: 'bt-1', sceneId: 'sc-1', beatNumber: 1, beatType: 'setup' }],
      initialDialogues: [
        { beatId: 'bt-1', order: 1, speaker: 'A', content: 'Hello' },
      ],
    });
    expect(n.dialogues.count).toBe(1);
    expect(n.dialogues.sorted()[0]?.speaker).toBe('A');
  });

  it('reconstitutes from state', () => {
    const n = factory.reconstitute({
      identity: 'recon-narrative',
      profile: { title: 'Reconstituted', format: 'novel' },
    });
    expect(n.identity.value).toBe('recon-narrative');
    expect(n.profile.title.value).toBe('Reconstituted');
  });
});
