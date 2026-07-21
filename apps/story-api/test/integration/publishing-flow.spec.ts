import { describe, it, expect } from 'vitest';
import { PublishingService } from '../../src/modules/publishing/publishing.service';
import { GenerationService } from '../../src/modules/generation/generation.service';
import { RevisionService } from '../../src/modules/revision/revision.service';
import type { StoryGenerationEngine } from '@storynaram/story-generator';

function createMockEngine(): StoryGenerationEngine {
  return {
    generate: async () => ({
      sessionId: 'mock-session',
      storyTitle: 'Mock Story',
      chapters: [],
      fullStory: '',
      qualityReport: { passed: true, checks: [] },
      metrics: {
        totalDurationMs: 0, totalTokens: 0, totalCost: 0,
        chaptersGenerated: 0, averageLatencyMs: 0,
        modelsUsed: [], providersUsed: [],
        streamingEnabled: false, retryCount: 0,
      },
      completedAt: new Date(),
    }),
    getHealth: () => ({ status: 'healthy', activeSessions: 0, totalGenerations: 0, failedGenerations: 0 }),
    getSession: () => undefined,
  } as unknown as StoryGenerationEngine;
}

describe('Publishing Pipeline Flow', () => {
  const mockEngine = createMockEngine();
  const publishingService = new PublishingService();
  const generationService = new GenerationService(mockEngine);
  const revisionService = new RevisionService();

  it('should run full AI publishing pipeline', async () => {
    const storyId = 'pipeline-test-story';

    const generation = await generationService.generate({ storyId });
    expect(generation.status).toBe('queued');

    const revision = await revisionService.revise({ storyId, focus: ['grammar', 'style'] });
    expect(revision.status).toBe('queued');

    const publication = await publishingService.create({ storyId, formats: ['pdf', 'epub', 'html'] });
    expect(publication.status).toBe('pending');
    expect(publication.formats).toHaveLength(3);

    const status = await publishingService.getStatus(publication.id);
    expect(status.status).toBe('pending');
  });
});
