import { describe, it, expect } from 'vitest';
import { StoryQualityScore } from '../src/quality/story-quality-score';

describe('StoryQualityScore', () => {
  const scorer = new StoryQualityScore();

  const defaultParams = {
    character: {
      presentCharacters: ['Hero'],
      expectedCharacters: ['Hero'],
      dialogueProportions: 0.3,
      characterMentions: new Map([['Hero', 10]]),
      characterTraits: new Map(),
    },
    world: {
      worldNames: ['Atheria'],
      locationCount: 5,
      cultureMentions: 2,
      magicMentions: 3,
      technologyMentions: 0,
      environmentMentions: 4,
      consistencyIssues: [],
    },
    timeline: {
      totalEvents: 3,
      chronologicalOrder: true,
      flashbackCount: 1,
      timeJumpCount: 0,
      ageConsistencyIssues: [],
      temporalContradictions: [],
    },
    canon: {
      factViolations: [],
      referenceErrors: [],
      eventContradictions: [],
      historyInconsistencies: [],
      relationshipErrors: [],
    },
    narrative: {
      pacingIssues: [],
      flowIssues: [],
      transitionIssues: [],
      sceneOrderIssues: [],
      chapterOrderIssues: [],
      chapterCount: 2,
      avgChapterWordCount: 500,
    },
    dialogue: {
      totalDialogueLines: 15,
      uniqueSpeakers: 2,
      dialogueProportion: 0.3,
      weakTags: ['said'],
      repetitiveTags: [],
      dialogueLengthIssues: [],
    },
    readability: {
      totalWords: 1000,
      totalSentences: 60,
      totalSyllables: 1500,
      complexWords: 150,
      avgSentenceLength: 16.7,
      paragraphCount: 20,
    },
    emotion: {
      emotionalWords: 50,
      totalWords: 1000,
      emotionalVariety: 6,
      positiveRatio: 0.5,
      negativeRatio: 0.3,
      intenseEmotions: 2,
    },
    consistency: {
      characterInconsistencies: [],
      worldInconsistencies: [],
      timelineInconsistencies: [],
      plotInconsistencies: [],
      styleInconsistencies: [],
    },
  };

  it('calculates overall score', () => {
    const scores = scorer.calculate(defaultParams);
    expect(scores.overall).toBeGreaterThan(0);
    expect(scores.overall).toBeLessThanOrEqual(100);
  });

  it('returns all category scores', () => {
    const scores = scorer.calculate(defaultParams);

    expect(scores).toHaveProperty('character');
    expect(scores).toHaveProperty('world');
    expect(scores).toHaveProperty('timeline');
    expect(scores).toHaveProperty('canon');
    expect(scores).toHaveProperty('narrative');
    expect(scores).toHaveProperty('dialogue');
    expect(scores).toHaveProperty('readability');
    expect(scores).toHaveProperty('emotion');
    expect(scores).toHaveProperty('consistency');
    expect(scores).toHaveProperty('overall');
  });

  it('penalizes missing characters', () => {
    const params = { ...defaultParams, character: { ...defaultParams.character, presentCharacters: [] } };
    const scores = scorer.calculate(params);
    expect(scores.character).toBeLessThan(100);
  });

  it('penalizes timeline contradictions', () => {
    const params = { ...defaultParams, timeline: { ...defaultParams.timeline, temporalContradictions: ['Date mismatch'] } };
    const scores = scorer.calculate(params);
    expect(scores.timeline).toBeLessThan(100);
  });

  it('penalizes canon violations', () => {
    const params = { ...defaultParams, canon: { ...defaultParams.canon, factViolations: ['Wrong name'] } };
    const scores = scorer.calculate(params);
    expect(scores.canon).toBeLessThan(100);
  });

  it('returns 0 for empty story dialogue', () => {
    const params = { ...defaultParams, dialogue: { ...defaultParams.dialogue, totalDialogueLines: 0 } };
    const scores = scorer.calculate(params);
    expect(scores.dialogue).toBe(0);
  });

  it('handles completely empty params', () => {
    const scores = scorer.calculate({
      character: { presentCharacters: [], expectedCharacters: [], dialogueProportions: 0, characterMentions: new Map(), characterTraits: new Map() },
      world: { worldNames: [], locationCount: 0, cultureMentions: 0, magicMentions: 0, technologyMentions: 0, environmentMentions: 0, consistencyIssues: [] },
      timeline: { totalEvents: 0, chronologicalOrder: true, flashbackCount: 0, timeJumpCount: 0, ageConsistencyIssues: [], temporalContradictions: [] },
      canon: { factViolations: [], referenceErrors: [], eventContradictions: [], historyInconsistencies: [], relationshipErrors: [] },
      narrative: { pacingIssues: [], flowIssues: [], transitionIssues: [], sceneOrderIssues: [], chapterOrderIssues: [], chapterCount: 0, avgChapterWordCount: 0 },
      dialogue: { totalDialogueLines: 0, uniqueSpeakers: 0, dialogueProportion: 0, weakTags: [], repetitiveTags: [], dialogueLengthIssues: [] },
      readability: { totalWords: 0, totalSentences: 0, totalSyllables: 0, complexWords: 0, avgSentenceLength: 0, paragraphCount: 0 },
      emotion: { emotionalWords: 0, totalWords: 0, emotionalVariety: 0, positiveRatio: 0, negativeRatio: 0, intenseEmotions: 0 },
      consistency: { characterInconsistencies: [], worldInconsistencies: [], timelineInconsistencies: [], plotInconsistencies: [], styleInconsistencies: [] },
    });

    expect(scores.overall).toBeDefined();
  });
});
