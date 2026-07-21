import { describe, it, expect } from 'vitest';
import { PublishingService } from '../../src/modules/publishing/publishing.service';

describe('PublishingService', () => {
  const service = new PublishingService();

  it('should create a publication', async () => {
    const pub = await service.create({ storyId: 'story-1', formats: ['pdf', 'html'] });
    expect(pub.id).toBeDefined();
    expect(pub.storyId).toBe('story-1');
    expect(pub.status).toBe('pending');
    expect(pub.formats).toContain('pdf');
  });

  it('should find all publications', async () => {
    await service.create({ storyId: 'story-2' });
    const pubs = await service.findAll();
    expect(pubs.length).toBeGreaterThanOrEqual(1);
  });

  it('should get publication by id', async () => {
    const created = await service.create({ storyId: 'story-3' });
    const found = await service.findById(created.id);
    expect(found.id).toBe(created.id);
  });

  it('should return status', async () => {
    const created = await service.create({ storyId: 'story-4' });
    const status = await service.getStatus(created.id);
    expect(status.status).toBe('pending');
  });
});
