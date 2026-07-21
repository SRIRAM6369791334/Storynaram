import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ExecutionResult } from '@storynaram/narrative-execution';
import type { StoryDraft, ChapterDraft, ExecutionReport, ValidationReport, CharacterProse, WorldProse } from '@storynaram/narrative-execution';
import { StoryService } from '../story/story.service';
import { CharacterService } from '../character/character.service';
import { WorldService } from '../world/world.service';
import { TimelineService } from '../timeline/timeline.service';
import { CanonService } from '../canon/canon.service';
import { NarrativeService } from '../narrative/narrative.service';
import { CompositionService } from '../composition/composition.service';
import type { ChapterInputDto } from './dto/generate-story.dto';

@Injectable()
export class GenerationDataLoader {
  constructor(
    private readonly storyService: StoryService,
    private readonly characterService: CharacterService,
    private readonly worldService: WorldService,
    private readonly timelineService: TimelineService,
    private readonly canonService: CanonService,
    private readonly narrativeService: NarrativeService,
    private readonly compositionService: CompositionService,
  ) {}

  async load(
    storyId: string,
    chapters?: ChapterInputDto[],
    options?: { model?: string },
  ): Promise<ExecutionResult> {
    const story = await this.storyService.findById(storyId).catch(() => null);

    const storyTitle = story?.title ?? 'Untitled Story';
    const genres = story?.genres ?? [];
    const storyDescription = story?.description;

    const chapterDrafts: ChapterDraft[] = (chapters ?? [{ number: 1, title: 'Chapter 1' }]).map(c => ({
      number: c.number,
      title: c.title,
      content: '',
      wordCount: 0,
    }));

    const [characters, worlds, timelines, canons, narratives, compositions] = await Promise.all([
      this.characterService.findAll(storyId),
      this.worldService.findByStoryId(storyId),
      this.timelineService.findByStoryId(storyId),
      this.canonService.findByStoryId(storyId),
      this.narrativeService.findByStoryId(storyId),
      this.compositionService.findByStoryId(storyId),
    ]);

    const characterProse: CharacterProse[] = characters.map(c => ({
      name: c.name,
      role: c.role ?? 'unknown',
      introduction: '',
      dialogue: '',
      scenes: [],
    }));

    const worldProse: WorldProse[] = worlds.map(w => ({
      name: w.name,
      regions: [],
      description: w.description ?? '',
    }));

    const timelineEvents = timelines.map(t => ({
      date: '',
      title: t.name,
      narrative: t.description ?? '',
    }));

    const canonContext = canons.map(c => c.name + (c.description ? `: ${c.description}` : '')).join('\n');

    const narrativeSynopsis = narratives.map(n => n.description ?? '').filter(Boolean).join('\n') || storyDescription || '';

    const compositionArcs = compositions.map(c => ({
      name: c.title,
      content: c.description ?? '',
    }));

    const storyDraft: StoryDraft = {
      title: storyTitle,
      chapters: chapterDrafts,
      characters: characterProse,
      worlds: worldProse,
      timeline: { events: timelineEvents, overallTimeline: '' },
      narrative: { synopsis: narrativeSynopsis, chapters: [] },
      composition: { arcs: compositionArcs, overallStructure: '' },
      validationResults: [],
      metadata: {
        storyId,
        genres,
        canonContext,
        characterCount: characters.length,
        worldCount: worlds.length,
        timelineCount: timelines.length,
        canonCount: canons.length,
        narrativeCount: narratives.length,
        compositionCount: compositions.length,
      },
    };

    const executionReport: ExecutionReport = {
      sessionId: randomUUID(),
      status: 'completed',
      stages: [],
      totalDurationMs: 0,
      totalTokens: 0,
      model: options?.model ?? 'mock-model',
    };

    const validationReport: ValidationReport = {
      passed: true,
      validations: [],
      summary: '',
    };

    return new ExecutionResult({
      sessionId: randomUUID(),
      storyDraft,
      executionReport,
      validationReport,
      statistics: {
        totalTasks: 1,
        completedTasks: 0,
        failedTasks: 0,
        totalDurationMs: 0,
        totalTokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        agentTimings: [],
        stageTimings: [],
      },
    });
  }
}
