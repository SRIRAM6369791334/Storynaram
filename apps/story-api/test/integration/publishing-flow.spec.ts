import { describe, it, expect, beforeAll } from 'vitest';
import { PublishingService } from '../../src/modules/publishing/publishing.service';
import { GenerationService } from '../../src/modules/generation/generation.service';
import { RevisionService } from '../../src/modules/revision/revision.service';
import { JobsService } from '../../src/jobs/jobs.service';

describe('Publishing Pipeline Flow', () => {
  const publishingService = new PublishingService();
  const revisionService = new RevisionService();
  let generationService: GenerationService;
  let jobsService: JobsService;
  let enqueuedJobs: Array<{ generationId: string; storyId: string }>;

  beforeAll(() => {
    jobsService = new JobsService();
    enqueuedJobs = [];

    const mockQueue = {
      add: async (_name: string, data: Record<string, unknown>, _opts?: unknown) => {
        const generationId = data.generationId as string;
        enqueuedJobs.push({ generationId, storyId: data.storyId as string });
        jobsService.updateJob(generationId, { status: 'queued' });
        return { id: generationId, attemptsMade: 0 };
      },
      getJob: async () => null,
    };

    generationService = new GenerationService(mockQueue as never, jobsService);
  });

  it('should enqueue generation and return queued status', async () => {
    const storyId = 'pipeline-test-story';

    const generation = await generationService.generate({ storyId });
    expect(generation.status).toBe('queued');
    expect(generation.id).toBeDefined();
    expect(enqueuedJobs).toHaveLength(1);
    expect(enqueuedJobs[0]!.storyId).toBe(storyId);

    const revision = await revisionService.revise({ storyId, focus: ['grammar', 'style'] });
    expect(revision.status).toBe('queued');

    const publication = await publishingService.create({ storyId, formats: ['pdf', 'epub', 'html'] });
    expect(publication.status).toBe('pending');
    expect(publication.formats).toHaveLength(3);

    const status = await publishingService.getStatus(publication.id);
    expect(status.status).toBe('pending');
  });
});
