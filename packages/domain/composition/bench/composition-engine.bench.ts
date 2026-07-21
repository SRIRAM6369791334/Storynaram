import { bench, describe } from 'vitest';
import { CompositionEngine } from '../src/composition-engine';
import { StoryAggregate } from '../src/story-aggregate';
import { StoryIdentity } from '../src/story-identity';

describe('CompositionEngine benchmarks', () => {
  const engine = new CompositionEngine();
  const story = new StoryAggregate(StoryIdentity.create());
  story.initialize('Bench Story', 'novel');
  story.setPlot('threeAct');
  for (let i = 0; i < 100; i++) {
    story.addPlotPoint(`pp-${i}`, 'setup', `ch-${i}`, `sc-${i}`, '', '', i);
  }
  for (let i = 0; i < 50; i++) {
    story.addArc(`arc-${i}`, `Arc ${i}`);
    story.addConflict(`c-${i}`, 'characterVsCharacter', '', 'moderate', ['a', 'b']);
    story.addTheme(`th-${i}`, 'love', `Theme ${i}`);
  }

  bench('analyze story with 100 plot points', () => {
    engine.analyze(story);
  });

  bench('generate outline', () => {
    engine.generateOutline(story);
  });

  bench('generate composition graph', () => {
    engine.generateCompositionGraph(story);
  });
});
