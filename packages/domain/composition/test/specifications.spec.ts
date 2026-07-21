import { describe, it, expect } from 'vitest';
import { StoryAggregate } from '../src/story-aggregate';
import { StoryIdentity } from '../src/story-identity';
import {
  DraftSpec, PlanningSpec, WritingSpec, CompletedSpec, PublishedSpec,
  StandaloneSpec, SeriesSpec, BranchingSpec, LinearSpec,
} from '../src/story-specifications';

describe('Specifications', () => {
  it('DraftSpec matches concept phase', () => {
    const spec = new DraftSpec();
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    expect(spec.isSatisfiedBy(s)).toBe(true);
  });

  it('PlanningSpec matches development phase', () => {
    const spec = new PlanningSpec();
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.setPhase('development');
    expect(spec.isSatisfiedBy(s)).toBe(true);
  });

  it('WritingSpec matches drafting', () => {
    const spec = new WritingSpec();
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.setPhase('drafting');
    expect(spec.isSatisfiedBy(s)).toBe(true);
  });

  it('CompletedSpec matches complete', () => {
    const spec = new CompletedSpec();
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    expect(spec.isSatisfiedBy(s)).toBe(false);
    s.complete();
    expect(spec.isSatisfiedBy(s)).toBe(true);
  });

  it('PublishedSpec matches published', () => {
    const spec = new PublishedSpec();
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    expect(spec.isSatisfiedBy(s)).toBe(false);
    s.publish();
    expect(spec.isSatisfiedBy(s)).toBe(true);
  });

  it('StandaloneSpec matches standalone narrative', () => {
    const spec = new StandaloneSpec();
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    expect(spec.isSatisfiedBy(s)).toBe(true);
  });

  it('SeriesSpec matches non-standalone', () => {
    const spec = new SeriesSpec();
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    expect(spec.isSatisfiedBy(s)).toBe(false);
  });

  it('BranchingSpec matches branching plot', () => {
    const spec = new BranchingSpec();
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.setPlot('threeAct', 'branching');
    expect(spec.isSatisfiedBy(s)).toBe(true);
  });

  it('LinearSpec matches linear plot', () => {
    const spec = new LinearSpec();
    const s = new StoryAggregate(new StoryIdentity('1'));
    s.initialize('Test', 'novel');
    s.setPlot('threeAct', 'linear');
    expect(spec.isSatisfiedBy(s)).toBe(true);
  });
});
