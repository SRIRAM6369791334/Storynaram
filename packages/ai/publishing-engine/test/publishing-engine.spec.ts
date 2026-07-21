import { describe, it, expect } from 'vitest';
import { PublishingEngine } from '../src/engine/publishing-engine';
import { RevisionResult, type RevisedChapter } from '@storynaram/revision-engine';

function makeMockResult(): RevisionResult {
  const chapters: RevisedChapter[] = [
    { number: 1, originalTitle: 'The Beginning', originalContent: 'Once upon a time.', revisedContent: 'Once upon a time there was a hero.', changes: 2, issuesFound: 1, issuesResolved: 1, qualityImprovement: 10 },
    { number: 2, originalTitle: 'The Middle', originalContent: 'The hero advanced.', revisedContent: 'The brave hero advanced through the forest.', changes: 3, issuesFound: 2, issuesResolved: 2, qualityImprovement: 15 },
  ];

  return new RevisionResult({
    sessionId: 'rev-1', storyTitle: 'Test Story', originalFullStory: '', revisedFullStory: '',
    chapters, revisionReport: {
      summary: '', passed: true, passes: [], qualityScores: { overall: 70, character: 70, timeline: 70, canon: 70, narrative: 70, dialogue: 70, grammar: 70, style: 70 },
      issues: [], improvements: [],
    },
    statistics: {} as any,
  });
}

describe('PublishingEngine', () => {
  it('publishes a story and returns publishing result', async () => {
    const engine = new PublishingEngine({ author: 'Test Author' });
    const result = await engine.publish(makeMockResult());

    expect(result.sessionId).toBeDefined();
    expect(result.storyTitle).toBe('Test Story');
    expect(result.rendered).toHaveLength(1);
    expect(result.exported.length).toBeGreaterThan(0);
    expect(result.toc.length).toBe(2);
  });

  it('renders in specified format', async () => {
    const engine = new PublishingEngine();
    const result = await engine.publish(makeMockResult(), { renderFormat: 'html' });

    const htmlRendered = result.rendered.find(r => r.format === 'html');
    expect(htmlRendered).toBeDefined();
    expect(htmlRendered!.content).toContain('<!DOCTYPE html>');
  });

  it('reports engine health', () => {
    const engine = new PublishingEngine();
    const health = engine.getHealth();

    expect(health.status).toBe('healthy');
    expect(health.activeSessions).toBe(0);
  });

  it('generates table of contents', async () => {
    const engine = new PublishingEngine();
    const result = await engine.publish(makeMockResult());

    expect(result.toc).toHaveLength(2);
    expect(result.toc[0]!.title).toContain('The Beginning');
    expect(result.toc[1]!.title).toContain('The Middle');
  });

  it('supports cancellation via AbortSignal', async () => {
    const controller = new AbortController();
    controller.abort();

    const engine = new PublishingEngine();
    await expect(engine.publish(makeMockResult(), {}, controller.signal)).rejects.toThrow();
  });

  it('exports multiple formats', async () => {
    const engine = new PublishingEngine();
    const result = await engine.publish(makeMockResult(), { exportFormats: ['html', 'markdown', 'txt'] });

    const formats = result.exported.map(e => e.format);
    expect(formats).toContain('html');
    expect(formats).toContain('markdown');
    expect(formats).toContain('txt');
  });

  it('handles empty story gracefully', async () => {
    const emptyResult = { ...makeMockResult(), chapters: [] };

    const engine = new PublishingEngine();
    const result = await engine.publish(emptyResult);

    expect(result.rendered[0]!.chapters).toHaveLength(0);
    expect(result.toc).toHaveLength(0);
  });

  it('provides publishing statistics', async () => {
    const engine = new PublishingEngine({ author: 'Author' });
    const result = await engine.publish(makeMockResult());

    const stats = result.statistics.getStats(2, 1, 3);
    expect(stats.chaptersProcessed).toBe(2);
    expect(stats.formatsRendered).toBe(1);
    expect(stats.formatsExported).toBe(3);
  });
});
