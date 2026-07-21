import { describe, it, expect, beforeEach } from 'vitest';
import { CompositionEngine } from '../src/composition-engine';
import { StoryAggregate } from '../src/story-aggregate';
import { StoryIdentity } from '../src/story-identity';

describe('CompositionEngine', () => {
  let engine: CompositionEngine;

  beforeEach(() => {
    engine = new CompositionEngine();
  });

  it('analyzes a story and identifies violations', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Story', 'novel');
    s.setPlot('threeAct');
    s.addPlotPoint('pp-1', 'setup', 'ch-1', 'sc-1', 'Start', '', 1);
    s.addPlotPoint('pp-2', 'climax', 'ch-2', 'sc-2', 'Middle', '', 2);
    s.addPlotPoint('pp-3', 'resolution', 'ch-3', 'sc-3', 'End', '', 3);
    s.addArc('arc-1', 'Main Arc', 'completed');
    s.addTheme('th-1', 'love', 'Love wins');
    s.addConflict('c-1', 'characterVsCharacter', 'Fight', 'minor', ['a', 'b']);

    const result = engine.analyze(s);
    expect(result.storyId).toBe('1');
    expect(result.report.totalPlotPoints).toBe(3);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('generates outline from story', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test Story', 'novel');
    s.setPlot('threeAct');
    s.addPlotPoint('pp-1', 'setup', 'ch-1', 'sc-1', 'Chapter 1', '', 1);
    s.addArc('arc-1', 'Hero Journey');
    s.addTheme('th-1', 'love', 'Love');
    s.addConflict('c-1', 'characterVsCharacter', 'Conflict', 'minor', ['a', 'b']);

    const outline = engine.generateOutline(s);
    expect(outline).toContain('Test Story');
    expect(outline).toContain('Chapter 1');
    expect(outline).toContain('Hero Journey');
  });

  it('generates composition graph', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.setPlot('threeAct');
    s.addPlotPoint('pp-1', 'setup', 'ch-1', 'sc-1', 'Start', '', 1);

    const graph = engine.generateCompositionGraph(s);
    expect(graph.nodes).toBeDefined();
    expect(graph.nodes).toHaveLength(1);
  });

  it('tracks analysis statistics', () => {
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    engine.analyze(s);
    expect(engine.statistics.totalAnalyses).toBe(1);
    expect(engine.statistics.storiesValidated).toBe(1);
  });
});
