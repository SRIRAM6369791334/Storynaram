import { describe, it, expect } from 'vitest';
import { StoryService } from '../../src/modules/story/story.service';
import { CharacterService } from '../../src/modules/character/character.service';
import { WorldService } from '../../src/modules/world/world.service';

describe('Story Creation Flow', () => {
  const storyService = new StoryService();
  const characterService = new CharacterService();
  const worldService = new WorldService();

  it('should create a story with characters and world', async () => {
    const story = await storyService.create({ title: 'Integrated Story', description: 'Full flow test', genres: ['fantasy'] });
    expect(story.status).toBe('draft');

    const character = await characterService.create({ name: 'Hero', role: 'protagonist', storyId: story.id });
    expect(character.name).toBe('Hero');
    expect(character.role).toBe('protagonist');

    const world = await worldService.create({ name: 'Fantasy Land', description: 'A magical world', storyId: story.id });
    expect(world.name).toBe('Fantasy Land');

    const stories = await storyService.findAll();
    expect(stories.some(s => s.id === story.id)).toBe(true);

    await storyService.update(story.id, { title: 'Updated Integrated Story' });
    const updated = await storyService.findById(story.id);
    expect(updated.title).toBe('Updated Integrated Story');
  });
});
