import { bench, describe } from 'vitest';
import { NarrativeFactory } from '../src/narrative-factory';

describe('NarrativeFactory benchmarks', () => {
  const factory = new NarrativeFactory();

  bench('create basic narrative', () => {
    factory.create({ title: 'Bench Narrative' });
  });

  bench('create with 10 chapters and scenes', () => {
    factory.create({
      title: 'Bench',
      initialChapters: Array.from({ length: 10 }, (_, i) => ({
        title: `Chapter ${i + 1}`,
        chapterNumber: i + 1,
      })),
      initialScenes: Array.from({ length: 10 }, (_, i) => ({
        chapterId: `ch-${i}`,
        sceneNumber: 1,
        title: `Scene ${i + 1}`,
      })),
    });
  });

  bench('reconstitute from state', () => {
    factory.reconstitute({ identity: 'bench', profile: { title: 'Bench', format: 'novel' } });
  });
});
