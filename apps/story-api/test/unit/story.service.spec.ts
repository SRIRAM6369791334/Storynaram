import { describe, it, expect } from 'vitest';
import { StoryService } from '../../src/modules/story/story.service';

describe('StoryService', () => {
  const service = new StoryService();

  it('should create a story', async () => {
    const story = await service.create({ title: 'Test Story', description: 'A test' });
    expect(story.id).toBeDefined();
    expect(story.title).toBe('Test Story');
    expect(story.status).toBe('draft');
  });

  it('should find all stories', async () => {
    await service.create({ title: 'Story 1' });
    await service.create({ title: 'Story 2' });
    const stories = await service.findAll();
    expect(stories.length).toBeGreaterThanOrEqual(2);
  });

  it('should find a story by id', async () => {
    const created = await service.create({ title: 'Find Me' });
    const found = await service.findById(created.id);
    expect(found.title).toBe('Find Me');
  });

  it('should update a story', async () => {
    const created = await service.create({ title: 'Original' });
    const updated = await service.update(created.id, { title: 'Updated' });
    expect(updated.title).toBe('Updated');
  });

  it('should delete a story', async () => {
    const created = await service.create({ title: 'Delete Me' });
    await service.delete(created.id);
    await expect(service.findById(created.id)).rejects.toThrow('not found');
  });

  it('should throw on missing story', async () => {
    await expect(service.findById('00000000-0000-0000-0000-000000000000')).rejects.toThrow('not found');
  });
});
