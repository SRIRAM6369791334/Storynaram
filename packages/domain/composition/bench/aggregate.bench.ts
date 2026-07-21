import { bench, describe } from 'vitest';
import { StoryAggregate } from '../src/story-aggregate';
import { StoryIdentity } from '../src/story-identity';

describe('StoryAggregate benchmarks', () => {
  const story = new StoryAggregate(StoryIdentity.create());
  story.initialize('Bench Story', 'novel');
  story.setPlot('threeAct');
  for (let i = 0; i < 10; i++) {
    story.addPlotPoint(`pp-${i}`, 'setup', `ch-${i}`, `sc-${i}`, `Point ${i}`, '', i);
    story.addArc(`arc-${i}`, `Arc ${i}`);
    story.addConflict(`c-${i}`, 'characterVsCharacter', `Conflict ${i}`, 'moderate', ['a', 'b']);
    story.addTheme(`th-${i}`, 'love', `Theme ${i}`);
  }

  bench('add 10 plot points sequentially', () => {
    const s = new StoryAggregate(StoryIdentity.create());
    s.initialize('Bench', 'novel');
    s.setPlot('threeAct');
    for (let i = 0; i < 10; i++) {
      s.addPlotPoint(`pp-${i}`, 'setup', `ch-${i}`, `sc-${i}`, `Point ${i}`, '', i);
    }
  });

  bench('add 10 conflicts', () => {
    const s = new StoryAggregate(StoryIdentity.create());
    s.initialize('Bench', 'novel');
    for (let i = 0; i < 10; i++) {
      s.addConflict(`c-${i}`, 'characterVsCharacter', `Conflict ${i}`, 'moderate', ['a', 'b']);
    }
  });

  bench('serialize to JSON', () => {
    story.toJSON();
  });
});
