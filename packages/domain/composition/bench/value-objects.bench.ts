import { bench, describe } from 'vitest';
import { StoryIdentity } from '../src/story-identity';
import { StoryProfile } from '../src/story-profile';
import { StoryState } from '../src/story-state';
import { StoryVersion } from '../src/story-version';

describe('Story value objects benchmarks', () => {
  bench('identity creation', () => {
    StoryIdentity.create();
  });

  bench('profile creation', () => {
    new StoryProfile('Benchmark Story');
  });

  bench('state creation', () => {
    new StoryState('development');
  });

  bench('version creation', () => {
    new StoryVersion(1, 2, 3);
  });
});
