import { bench, describe } from 'vitest';
import { NarrativeTitle } from '../src/narrative-title';
import { NarrativeStatus } from '../src/narrative-status';
import { ChapterNumber, SceneNumber, BeatNumber, DialogueOrder } from '../src/narrative-numbers';
import { WordCount, ReadingTime } from '../src/narrative-metrics';
import { NarrativeMetadata } from '../src/narrative-metadata';

describe('Narrative value objects benchmarks', () => {
  bench('title creation', () => {
    new NarrativeTitle('The Hobbit');
  });

  bench('status creation', () => {
    new NarrativeStatus('published');
  });

  bench('chapter number creation', () => {
    new ChapterNumber(1);
  });

  bench('word count addition', () => {
    new WordCount(100).add(new WordCount(200));
  });

  bench('reading time calculation', () => {
    new ReadingTime(new WordCount(5000));
  });

  bench('metadata creation', () => {
    new NarrativeMetadata({ revision: 1, isStandalone: false });
  });
});
