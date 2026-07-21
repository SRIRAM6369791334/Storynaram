import { describe, it, expect } from 'vitest';
import { PublishingService } from '../../src/modules/publishing/publishing.service';
import { GenerationService } from '../../src/modules/generation/generation.service';
import { RevisionService } from '../../src/modules/revision/revision.service';

describe('Publishing Pipeline Flow', () => {
  const publishingService = new PublishingService();
  const generationService = new GenerationService();
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
