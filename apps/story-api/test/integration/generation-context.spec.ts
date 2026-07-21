import { describe, it, expect, beforeAll } from 'vitest';
import { StoryService } from '../../src/modules/story/story.service';
import { CharacterService } from '../../src/modules/character/character.service';
import { WorldService } from '../../src/modules/world/world.service';
import { TimelineService } from '../../src/modules/timeline/timeline.service';
import { CanonService } from '../../src/modules/canon/canon.service';
import { NarrativeService } from '../../src/modules/narrative/narrative.service';
import { CompositionService } from '../../src/modules/composition/composition.service';
import { GenerationDataLoader } from '../../src/modules/generation/generation-data-loader';
import { CreateStoryDto } from '../../src/modules/story/dto/create-story.dto';
import { CreateCharacterDto } from '../../src/modules/character/dto/create-character.dto';
import { CreateWorldDto } from '../../src/modules/world/dto/create-world.dto';
import { CreateTimelineDto } from '../../src/modules/timeline/dto/create-timeline.dto';
import { CreateCanonDto } from '../../src/modules/canon/dto/create-canon.dto';
import { CreateNarrativeDto } from '../../src/modules/narrative/dto/create-narrative.dto';
import { CreateCompositionDto } from '../../src/modules/composition/dto/create-composition.dto';

describe('Generation Context Loading', () => {
  const storyService = new StoryService();
  const characterService = new CharacterService();
  const worldService = new WorldService();
  const timelineService = new TimelineService();
  const canonService = new CanonService();
  const narrativeService = new NarrativeService();
  const compositionService = new CompositionService();

  const dataLoader = new GenerationDataLoader(
    storyService, characterService, worldService,
    timelineService, canonService, narrativeService, compositionService,
  );

  let storyId: string;

  beforeAll(async () => {
    const story = await storyService.create({ title: 'The Dragon War', description: 'A tale of fire and ice', genres: ['fantasy', 'adventure'] } as CreateStoryDto);
    storyId = story.id;

    await characterService.create({ name: 'Aragorn', role: 'hero', species: 'human', storyId } as CreateCharacterDto);
    await characterService.create({ name: 'Legolas', role: 'companion', species: 'elf', storyId } as CreateCharacterDto);
    await characterService.create({ name: 'Gimli', role: 'companion', species: 'dwarf', storyId } as CreateCharacterDto);

    await worldService.create({ name: 'Middle Earth', description: 'A world of fantasy and magic', genre: 'fantasy', storyId } as CreateWorldDto);

    await timelineService.create({ name: 'Third Age', description: 'The age of the War of the Ring', storyId } as CreateTimelineDto);

    await canonService.create({ name: 'One Ring', description: 'The One Ring rules them all', storyId } as CreateCanonDto);
    await canonService.create({ name: 'Elvish Language', description: 'Sindarin and Quenya are the elvish tongues', storyId } as CreateCanonDto);

    await narrativeService.create({ title: 'Main Plot', description: 'A group of heroes must destroy the One Ring', storyId } as CreateNarrativeDto);

    await compositionService.create({ title: 'Three-Act Structure', description: 'Act 1: Fellowship, Act 2: Journey, Act 3: Return', storyId } as CreateCompositionDto);
  });

  it('loads full context with real data', async () => {
    const result = await dataLoader.load(storyId, [{ number: 1, title: 'The Fellowship' }]);

    expect(result.storyDraft.title).toBe('The Dragon War');

    expect(result.storyDraft.characters).toHaveLength(3);
    expect(result.storyDraft.characters[0]!.name).toBe('Aragorn');
    expect(result.storyDraft.characters[2]!.name).toBe('Gimli');

    expect(result.storyDraft.worlds).toHaveLength(1);
    expect(result.storyDraft.worlds[0]!.name).toBe('Middle Earth');

    expect(result.storyDraft.timeline.events).toHaveLength(1);
    expect(result.storyDraft.timeline.events[0]!.title).toBe('Third Age');

    expect(result.storyDraft.narrative.synopsis).toContain('One Ring');

    expect(result.storyDraft.composition.arcs).toHaveLength(1);
    expect(result.storyDraft.composition.arcs[0]!.name).toBe('Three-Act Structure');

    expect(result.storyDraft.metadata.characterCount).toBe(3);
    expect(result.storyDraft.metadata.worldCount).toBe(1);
    expect(result.storyDraft.metadata.canonCount).toBe(2);
    expect(result.storyDraft.metadata.genres).toEqual(['fantasy', 'adventure']);
    expect(result.storyDraft.metadata.canonContext).toContain('One Ring');

    expect(result.storyDraft.chapters).toHaveLength(1);
    expect(result.storyDraft.chapters[0]!.title).toBe('The Fellowship');
  });

  it('handles missing story gracefully', async () => {
    const result = await dataLoader.load('nonexistent-id', [{ number: 1, title: 'Chapter 1' }]);
    expect(result.storyDraft.title).toBe('Untitled Story');
    expect(result.storyDraft.characters).toHaveLength(0);
    expect(result.storyDraft.worlds).toHaveLength(0);
  });

  it('characters have roles assigned', async () => {
    const result = await dataLoader.load(storyId);
    expect(result.storyDraft.characters[0]!.role).toBe('hero');
    expect(result.storyDraft.characters[1]!.role).toBe('companion');
  });
});
