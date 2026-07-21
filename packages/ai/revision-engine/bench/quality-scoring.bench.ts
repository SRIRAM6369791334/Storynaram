import { bench, describe } from 'vitest';
import { StoryQualityScore, type StoryQualityScoreParams } from '../src/quality/story-quality-score';
import { CharacterScore } from '../src/quality/character-score';
import { ReadabilityScore } from '../src/quality/readability-score';

const scorer = new StoryQualityScore();
const characterScorer = new CharacterScore();
const readabilityScorer = new ReadabilityScore();

const params: StoryQualityScoreParams = {
  character: { presentCharacters: ['Hero', 'Villain', 'Guide'], expectedCharacters: ['Hero', 'Villain', 'Guide', 'Mentor'], dialogueProportions: 0.3, characterMentions: new Map([['Hero', 20], ['Villain', 10], ['Guide', 5]]), characterTraits: new Map([['Hero', ['brave', 'kind']]]) },
  world: { worldNames: ['Atheria', 'Nox'], locationCount: 10, cultureMentions: 5, magicMentions: 8, technologyMentions: 2, environmentMentions: 12, consistencyIssues: [] },
  timeline: { totalEvents: 5, chronologicalOrder: true, flashbackCount: 2, timeJumpCount: 1, ageConsistencyIssues: [], temporalContradictions: [] },
  canon: { factViolations: [], referenceErrors: [], eventContradictions: [], historyInconsistencies: [], relationshipErrors: [] },
  narrative: { pacingIssues: [], flowIssues: [], transitionIssues: [], sceneOrderIssues: [], chapterOrderIssues: [], chapterCount: 5, avgChapterWordCount: 800 },
  dialogue: { totalDialogueLines: 30, uniqueSpeakers: 3, dialogueProportion: 0.3, weakTags: ['said'], repetitiveTags: [], dialogueLengthIssues: [] },
  readability: { totalWords: 4000, totalSentences: 250, totalSyllables: 6000, complexWords: 600, avgSentenceLength: 16, paragraphCount: 80 },
  emotion: { emotionalWords: 200, totalWords: 4000, emotionalVariety: 8, positiveRatio: 0.5, negativeRatio: 0.4, intenseEmotions: 5 },
  consistency: { characterInconsistencies: [], worldInconsistencies: [], timelineInconsistencies: [], plotInconsistencies: [], styleInconsistencies: [] },
};

describe('Quality Scoring Performance', () => {
  bench('full quality score calculation', () => {
    scorer.calculate(params);
  });

  bench('character score only', () => {
    characterScorer.calculate(params.character);
  });

  bench('readability score only', () => {
    readabilityScorer.calculate(params.readability);
  });
});
