import { describe, it, expect } from 'vitest';
import { RevisionEngine } from '../src/engine/revision-engine';
import { RevisionSession } from '../src/types/revision-session';
import { RevisionPipeline } from '../src/types/revision-pipeline';
import { RevisionMemory } from '../src/types/revision-memory';
import { RevisionStatistics } from '../src/types/revision-statistics';
import { StoryQualityScore } from '../src/quality/story-quality-score';
import { IssueDetector } from '../src/detection/issue-detector';
import { ImprovementApplier } from '../src/improvement/improvement-applier';
import { createCheckpoint } from '../src/types/revision-checkpoint';
import { GenerationResult, type GeneratedChapter } from '@storynaram/story-generator';

function makeMockResult(): GenerationResult {
  const chapters: GeneratedChapter[] = [
    { number: 1, title: 'Ch1', content: 'This is a test chapter with some content.', wordCount: 8, model: 'gpt-4', provider: 'openai', latencyMs: 100, tokenUsage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 } },
  ];

  return new GenerationResult({
    sessionId: 'gen-1', storyTitle: 'Regression Test', chapters,
    fullStory: '# Ch1\n\nThis is a test chapter with some content.',
    qualityReport: { passed: true, checks: [] },
    metrics: { totalDurationMs: 100, totalTokens: 150, totalCost: 0, chaptersGenerated: 1, averageLatencyMs: 100, modelsUsed: ['gpt-4'], providersUsed: ['openai'], streamingEnabled: false, retryCount: 0 },
  });
}

describe('Regression Tests', () => {
  it('RevisionEngine preserves original story content', async () => {
    const engine = new RevisionEngine({ passes: [] });
    const genResult = makeMockResult();
    const result = await engine.revise(genResult);

    expect(result.originalFullStory).toBe(genResult.fullStory);
  });

  it('RevisionSession serializes correctly', () => {
    const session = new RevisionSession({
      sessionId: 'test-1',
      generationResult: makeMockResult(),
      context: {
        sessionId: 'test-1',
        generationResult: makeMockResult(),
        options: { passes: ['grammar'], autoFix: false, generateReport: true, maxIterations: 1, strictMode: false },
      },
    });

    const json = session.toJSON();
    expect(json.sessionId).toBe('test-1');
    expect(json.status).toBe('created');
    expect(json.chapterCount).toBe(1);
  });

  it('RevisionPipeline handles concurrent stage operations', () => {
    const pipeline = new RevisionPipeline();
    for (let i = 0; i < 10; i++) {
      pipeline.addStage(`pass-${i}`, 'grammar');
    }

    expect(pipeline.state.stages).toHaveLength(10);
    for (let i = 0; i < 10; i++) {
      pipeline.startStage(`pass-${i}`);
      pipeline.completeStage(`pass-${i}`, i, Math.floor(i / 2));
    }

    expect(pipeline.isComplete()).toBe(true);
    expect(pipeline.state.totalIssuesFound).toBe(45);
    expect(pipeline.state.totalIssuesResolved).toBe(20);
  });

  it('RevisionMemory tracks records correctly', () => {
    const memory = new RevisionMemory();
    memory.record({
      passName: 'grammar',
      chapterNumber: 1,
      original: 'original',
      revised: 'revised',
      changes: 2,
      issues: ['spelling error'],
      timestamp: new Date(),
    });

    expect(memory.getTotalChanges()).toBe(2);
    expect(memory.getTotalIssues()).toHaveLength(1);
    expect(memory.getRecordsForPass('grammar')).toHaveLength(1);
    expect(memory.getRecordsForChapter(1)).toHaveLength(1);
  });

  it('RevisionMemory supports checkpoints', () => {
    const memory = new RevisionMemory();
    memory.addCheckpoint('snapshot1');
    memory.addCheckpoint('snapshot2');

    expect(memory.getCheckpointCount()).toBe(2);
    expect(memory.getCheckpoint(0)).toBe('snapshot1');
    expect(memory.getCheckpoint(1)).toBe('snapshot2');
  });

  it('RevisionStatistics calculates stats correctly', () => {
    const stats = new RevisionStatistics();
    stats.start();
    stats.recordPass('grammar', 100, 5, 3);
    stats.recordPass('character', 200, 2, 1);
    stats.setQualityScores(60, 80);

    const result = stats.getStats(2);
    expect(result.passesCompleted).toBe(2);
    expect(result.totalIssuesFound).toBe(7);
    expect(result.totalIssuesResolved).toBe(4);
    expect(result.overallQualityImprovement).toBe(20);
    expect(result.qualityScoreBefore).toBe(60);
    expect(result.qualityScoreAfter).toBe(80);
  });

  it('StoryQualityScore produces consistent results', () => {
    const scorer = new StoryQualityScore();
    const params = {
      character: { presentCharacters: ['A'], expectedCharacters: ['A'], dialogueProportions: 0.2, characterMentions: new Map([['A', 5]]), characterTraits: new Map() },
      world: { worldNames: ['W'], locationCount: 3, cultureMentions: 1, magicMentions: 1, technologyMentions: 0, environmentMentions: 2, consistencyIssues: [] },
      timeline: { totalEvents: 2, chronologicalOrder: true, flashbackCount: 0, timeJumpCount: 0, ageConsistencyIssues: [], temporalContradictions: [] },
      canon: { factViolations: [], referenceErrors: [], eventContradictions: [], historyInconsistencies: [], relationshipErrors: [] },
      narrative: { pacingIssues: [], flowIssues: [], transitionIssues: [], sceneOrderIssues: [], chapterOrderIssues: [], chapterCount: 1, avgChapterWordCount: 500 },
      dialogue: { totalDialogueLines: 10, uniqueSpeakers: 2, dialogueProportion: 0.2, weakTags: [], repetitiveTags: [], dialogueLengthIssues: [] },
      readability: { totalWords: 500, totalSentences: 30, totalSyllables: 750, complexWords: 75, avgSentenceLength: 16.7, paragraphCount: 10 },
      emotion: { emotionalWords: 25, totalWords: 500, emotionalVariety: 5, positiveRatio: 0.5, negativeRatio: 0.3, intenseEmotions: 1 },
      consistency: { characterInconsistencies: [], worldInconsistencies: [], timelineInconsistencies: [], plotInconsistencies: [], styleInconsistencies: [] },
    };

    const scores1 = scorer.calculate(params);
    const scores2 = scorer.calculate(params);

    expect(scores1).toEqual(scores2);
  });

  it('IssueDetector detects all issue types', () => {
    const detector = new IssueDetector();
    const issues = detector.detectAll({
      chapterNumber: 1,
      content: 'Their was a hero who recieved a mission. The hero traveled through the forest. "Hello" said Kael. "Greetings" said Kael. "Farewell" said Kael. "Goodbye" said Kael.',
      expectedCharacters: ['Hero', 'Missing'],
    });

    expect(issues.some(i => i.type === 'spelling')).toBe(true);
    expect(issues.some(i => i.type === 'missing-character')).toBe(true);
    expect(issues.some(i => i.type === 'weak-dialogue')).toBe(true);
  });

  it('ImprovementApplier generates diffs', () => {
    const applier = new ImprovementApplier();
    const diff = applier.generateDiff('line1\nline2\nline3', 'line1\nmodified\nline3\nline4');

    expect(diff.modifications).toBe(1);
    expect(diff.additions).toBe(1);
    expect(diff.deletions).toBe(0);
  });

  it('createCheckpoint creates valid snapshots', () => {
    const checkpoint = createCheckpoint('grammar', [{ number: 1, title: 'Ch1', content: 'text', wordCount: 1 }], 2, 80);

    expect(checkpoint.passName).toBe('grammar');
    expect(checkpoint.chapterSnapshots).toHaveLength(1);
    expect(checkpoint.chapterSnapshots[0]!.number).toBe(1);
    expect(checkpoint.totalChangesSoFar).toBe(2);
    expect(checkpoint.qualityScore).toBe(80);
  });
});
