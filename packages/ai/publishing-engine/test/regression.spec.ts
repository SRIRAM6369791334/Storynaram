import { describe, it, expect } from 'vitest';
import { PublishingEngine } from '../src/engine/publishing-engine';
import { PublishingSession } from '../src/types/publishing-session';
import { PublishingPipeline } from '../src/types/publishing-pipeline';
import { PublishingStatistics } from '../src/types/publishing-statistics';
import { TOCGenerator } from '../src/toc/toc-generator';
import { MetadataGenerator } from '../src/metadata/metadata-generator';
import { AssetPackager } from '../src/assets/asset-packager';
import { PackageValidator } from '../src/validation/package-validator';
import { createPublishingCheckpoint } from '../src/types/publishing-checkpoint';
import { RevisionResult, type RevisedChapter } from '@storynaram/revision-engine';

function makeMockResult(): RevisionResult {
  const chapters: RevisedChapter[] = [
    { number: 1, originalTitle: 'Ch1', originalContent: 'Old', revisedContent: 'New', changes: 1, issuesFound: 0, issuesResolved: 0, qualityImprovement: 5 },
    { number: 2, originalTitle: 'Ch2', originalContent: 'Old2', revisedContent: 'New2', changes: 1, issuesFound: 0, issuesResolved: 0, qualityImprovement: 5 },
  ];

  return new RevisionResult({
    sessionId: 'rev-1', storyTitle: 'Regression', originalFullStory: '', revisedFullStory: '',
    chapters, revisionReport: { summary: '', passed: true, passes: [], qualityScores: { overall: 60, character: 60, timeline: 60, canon: 60, narrative: 60, dialogue: 60, grammar: 60, style: 60 }, issues: [], improvements: [] },
    statistics: {} as any,
  });
}

describe('Regression Tests', () => {
  it('PublishingEngine produces consistent output', async () => {
    const engine = new PublishingEngine({ author: 'Author' });
    const input = makeMockResult();

    const result1 = await engine.publish(input);
    const result2 = await engine.publish(input);

    expect(result1.toc).toEqual(result2.toc);
    expect(result1.rendered).toHaveLength(result2.rendered.length);
  });

  it('PublishingSession serializes correctly', () => {
    const session = new PublishingSession({
      sessionId: 'test-1',
      revisionResult: makeMockResult(),
      context: {
        sessionId: 'test-1',
        revisionResult: makeMockResult(),
        options: {
          profile: 'novel', renderFormat: 'novel', exportFormats: ['html'],
          includeToc: true, includeMetadata: true, includeCover: true, includeAssets: true, includeIndexes: true,
          pageSize: '6x9', fontSize: 12, lineHeight: 1.6,
          margins: { top: 72, bottom: 72, left: 72, right: 72 },
        },
      },
    });

    const json = session.toJSON();
    expect(json.sessionId).toBe('test-1');
    expect(json.status).toBe('created');
    expect(json.chapterCount).toBe(2);
  });

  it('PublishingPipeline handles stage operations', () => {
    const pipeline = new PublishingPipeline();
    pipeline.addStage('render');
    pipeline.addStage('export');

    pipeline.startStage('render');
    pipeline.completeStage('render', 1000);
    pipeline.startStage('export');
    pipeline.completeStage('export', 2000);

    expect(pipeline.isComplete()).toBe(true);
    expect(pipeline.state.totalOutputSize).toBe(3000);
  });

  it('PublishingStatistics tracks correctly', () => {
    const stats = new PublishingStatistics();
    stats.start();
    stats.recordStage('render', 100);
    stats.recordStage('export', 200);
    stats.setTocEntryCount(5);

    const result = stats.getStats(2, 1, 2);
    expect(result.chaptersProcessed).toBe(2);
    expect(result.formatsRendered).toBe(1);
    expect(result.formatsExported).toBe(2);
    expect(result.tocEntries).toBe(5);
  });

  it('TOCGenerator is deterministic', () => {
    const gen = new TOCGenerator();
    const chapters = [
      { number: 1, title: 'A' },
      { number: 2, title: 'B' },
    ];

    const result1 = gen.generateTOC(chapters);
    const result2 = gen.generateTOC(chapters);

    expect(result1).toEqual(result2);
  });

  it('MetadataGenerator produces valid output', () => {
    const gen = new MetadataGenerator();
    const metadata = gen.generate({
      title: 'Test',
      author: 'Author',
      genre: ['fantasy'],
      tags: ['magic'],
      isbn: '978-3-16-148410-0',
    });

    expect(metadata.isbn).toBe('978-3-16-148410-0');
    expect(JSON.parse(JSON.stringify(metadata))).toBeTruthy();
  });

  it('AssetPackager handles empty input', () => {
    const packager = new AssetPackager();
    const glossary = packager.generateGlossary([]);
    expect(glossary).toBe('');
  });

  it('PackageValidator provides detailed checks', () => {
    const validator = new PackageValidator();
    const result = validator.validate({
      chapters: [{ number: 1, title: 'Ch1', content: 'Content' }],
      renderedFormats: ['novel'],
      exportedFormats: [],
      tocEntries: 1,
      metadataPresent: true,
    });

    expect(result.checks.length).toBe(7);
    for (const check of result.checks) {
      expect(check.name).toBeDefined();
      expect(check.severity).toBeDefined();
    }
  });

  it('createPublishingCheckpoint creates valid snapshots', () => {
    const checkpoint = createPublishingCheckpoint('render', ['novel'], ['pdf'], 5000);

    expect(checkpoint.stage).toBe('render');
    expect(checkpoint.formatsRendered).toEqual(['novel']);
    expect(checkpoint.formatsExported).toEqual(['pdf']);
    expect(checkpoint.outputSize).toBe(5000);
  });
});
