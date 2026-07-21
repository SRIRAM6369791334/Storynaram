import { describe, it, expect } from 'vitest';
import { PublishingEngine } from '../src/engine/publishing-engine';
import { publishStory, PublishingStartedEvent, PublishingCompletedEvent, ExportCompletedEvent } from '../src/integration';
import { RevisionResult, type RevisedChapter } from '@storynaram/revision-engine';

function makeMockResult(): RevisionResult {
  const chapters: RevisedChapter[] = [
    { number: 1, originalTitle: 'Ch1', originalContent: '', revisedContent: 'Content.', changes: 0, issuesFound: 0, issuesResolved: 0, qualityImprovement: 0 },
  ];

  return new RevisionResult({
    sessionId: 'rev-1', storyTitle: 'Test', originalFullStory: '', revisedFullStory: '',
    chapters, revisionReport: { summary: '', passed: true, passes: [], qualityScores: { overall: 50, character: 50, timeline: 50, canon: 50, narrative: 50, dialogue: 50, grammar: 50, style: 50 }, issues: [], improvements: [] },
    statistics: {} as any,
  });
}

describe('Integration', () => {
  it('publishStory function works', async () => {
    const engine = new PublishingEngine();
    const result = await publishStory(engine, makeMockResult());

    expect(result.sessionId).toBeDefined();
    expect(result.publishingReport).toBeDefined();
  });

  it('creates PublishingStartedEvent', () => {
    const event = new PublishingStartedEvent('s-1', 'Test', 1, ['html']);

    expect(event.sessionId).toBe('s-1');
    expect(event.formats).toEqual(['html']);
  });

  it('creates PublishingCompletedEvent', () => {
    const event = new PublishingCompletedEvent('s-1', 'Test', 2, 3, 5000);

    expect(event.formatsRendered).toBe(2);
    expect(event.formatsExported).toBe(3);
    expect(event.totalSize).toBe(5000);
  });

  it('creates ExportCompletedEvent', () => {
    const event = new ExportCompletedEvent('s-1', 'pdf', 'test.pdf', 1000);

    expect(event.format).toBe('pdf');
    expect(event.filename).toBe('test.pdf');
    expect(event.size).toBe(1000);
  });
});
