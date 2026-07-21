import { describe, bench } from 'vitest';
import { StoryService } from '../src/modules/story/story.service';
import { CharacterService } from '../src/modules/character/character.service';
import { SearchService } from '../src/modules/search/search.service';
import { HealthService } from '../src/modules/health/health.service';

describe('Story API Benchmarks', () => {
  const storyService = new StoryService();
  const characterService = new CharacterService();
  const searchService = new SearchService();
  const healthService = new HealthService();

  bench('story creation throughput', async () => {
    await storyService.create({ title: `Bench Story ${Date.now()}`, description: 'Benchmark test' });
  }, { iterations: 100, time: 5000 });

  bench('story lookup throughput', async () => {
    const story = await storyService.create({ title: 'Lookup Test' });
    await storyService.findById(story.id);
  }, { iterations: 100, time: 5000 });

  bench('character creation throughput', async () => {
    await characterService.create({ name: `Character ${Date.now()}`, role: 'hero' });
  }, { iterations: 100, time: 5000 });

  bench('search throughput', async () => {
    await searchService.index({ id: `${Date.now()}`, type: 'story', title: 'Search Test', content: 'benchmark' });
    await searchService.search('Search');
  }, { iterations: 100, time: 5000 });

  bench('health check throughput', async () => {
    await healthService.check();
  }, { iterations: 1000, time: 5000 });
});
