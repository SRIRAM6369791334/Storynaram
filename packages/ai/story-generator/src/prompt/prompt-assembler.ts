import type { StoryDraft, ChapterDraft, CharacterProse, WorldProse, CompositionProse } from '@storynaram/narrative-execution';

export interface AssembledPrompt {
  systemPrompt: string;
  userPrompt: string;
  estimatedTokens: number;
}

export class PromptAssembler {
  assembleChapterPrompt(draft: StoryDraft, chapter: ChapterDraft, previousContent: string, options?: { includeCharacterContext?: boolean; includeWorldContext?: boolean; includeTimelineContext?: boolean; includeCompositionContext?: boolean }): AssembledPrompt {
    const opts = {
      includeCharacterContext: true,
      includeWorldContext: true,
      includeTimelineContext: true,
      includeCompositionContext: true,
      ...options,
    };

    const systemPrompt = this.buildSystemPrompt(draft);
    const userPrompt = this.buildUserPrompt(draft, chapter, previousContent, opts);

    return {
      systemPrompt,
      userPrompt,
      estimatedTokens: this.estimateTokens(systemPrompt) + this.estimateTokens(userPrompt),
    };
  }

  assembleFullStoryPrompt(draft: StoryDraft): AssembledPrompt {
    const systemPrompt = [
      'You are an award-winning novelist. Write a complete, publish-ready story based on the provided plans and outlines.',
      '',
      'Style Guidelines:',
      '- Use vivid, sensory prose with strong narrative voice',
      '- Maintain consistent character voices and motivations',
      '- Show, don\'t tell — reveal character through action and dialogue',
      '- Balance dialogue, description, and action',
      '- Use pacing to build tension and release',
      '- Each scene must advance plot or develop character',
      '- End chapters with compelling hooks or resolutions',
    ].join('\n');

    const sections: string[] = [
      `TITLE: ${draft.title}`,
      '',
      'STORY OVERVIEW',
      `Synopsis: ${draft.narrative.synopsis}`,
      '',
    ];

    if (draft.characters.length > 0) {
      sections.push('CHARACTERS');
      for (const c of draft.characters) {
        sections.push(`  ${c.name} (${c.role}): ${c.introduction.slice(0, 200)}`);
      }
      sections.push('');
    }

    if (draft.worlds.length > 0) {
      sections.push('WORLD SETTINGS');
      for (const w of draft.worlds) {
        sections.push(`  ${w.name}: ${w.description.slice(0, 200)}`);
      }
      sections.push('');
    }

    sections.push('CHAPTER OUTLINES');
    for (const ch of draft.chapters) {
      sections.push(`  Chapter ${ch.number}: ${ch.title}`);
    }
    sections.push('');

    if (draft.composition.arcs.length > 0) {
      sections.push('COMPOSITION ARCS');
      for (const a of draft.composition.arcs) {
        sections.push(`  ${a.name}: ${a.content.slice(0, 200)}`);
      }
    }

    sections.push('');
    sections.push('Write the complete story with clear chapter divisions. Each chapter should be approximately 2000-3000 words.');

    return {
      systemPrompt,
      userPrompt: sections.join('\n'),
      estimatedTokens: this.estimateTokens(systemPrompt) + this.estimateTokens(sections.join('\n')),
    };
  }

  private buildSystemPrompt(draft: StoryDraft): string {
    return [
      'You are a professional fiction writer. Write compelling narrative prose based on the provided story plan.',
      '',
      'WRITING GUIDELINES',
      '- Use consistent point of view and tense throughout',
      '- Create vivid, immersive scenes with sensory details',
      '- Develop characters through action, dialogue, and internal monologue',
      '- Maintain narrative momentum and pacing',
      '- Use dialogue to reveal character and advance plot',
      '- Each scene should serve a purpose — advance plot, develop character, or build atmosphere',
      '- End chapters with compelling hooks or emotional resonance',
      `- The story genre is: ${(draft.metadata.genre as string[])?.join(', ') ?? 'fiction'}`,
      `- Key themes: ${(draft.metadata.themes as string[])?.join(', ') ?? 'none specified'}`,
    ].join('\n');
  }

  private buildUserPrompt(draft: StoryDraft, chapter: ChapterDraft, previousContent: string, opts: { includeCharacterContext: boolean; includeWorldContext: boolean; includeTimelineContext: boolean; includeCompositionContext: boolean }): string {
    const sections: string[] = [
      `STORY: ${draft.title}`,
      `CHAPTER ${chapter.number}: ${chapter.title}`,
      '',
    ];

    if (opts.includeCharacterContext && draft.characters.length > 0) {
      sections.push('CHARACTERS IN THIS CHAPTER');
      for (const c of draft.characters) {
        sections.push(`  ${c.name} (${c.role})`);
        if (c.introduction) sections.push(`    Introduction: ${c.introduction}`);
        if (c.dialogue) sections.push(`    Voice: ${c.dialogue.slice(0, 150)}`);
        if (c.scenes.length > 0) sections.push(`    Appears in scenes: ${c.scenes.join(', ')}`);
      }
      sections.push('');
    }

    if (opts.includeWorldContext && draft.worlds.length > 0) {
      sections.push('SETTINGS');
      for (const w of draft.worlds) {
        sections.push(`  ${w.name} — ${w.description.slice(0, 200)}`);
      }
      sections.push('');
    }

    if (opts.includeTimelineContext && draft.timeline.events.length > 0) {
      sections.push('TIMELINE CONTEXT');
      sections.push(`  ${draft.timeline.overallTimeline.slice(0, 200)}`);
      sections.push('');
    }

    if (opts.includeCompositionContext && draft.composition.arcs.length > 0) {
      sections.push('NARRATIVE ARCS');
      for (const a of draft.composition.arcs) {
        sections.push(`  ${a.name}: ${a.content.slice(0, 150)}`);
      }
      sections.push('');
    }

    if (previousContent) {
      sections.push('PREVIOUS CHAPTER SUMMARY');
      sections.push(previousContent.slice(-500));
      sections.push('');
    }

    sections.push(`Write Chapter ${chapter.number}: "${chapter.title}".`);
    sections.push('Use vivid prose, strong character voice, and maintain continuity with previous chapters.');
    sections.push('Target length: approximately 2000 words.');

    return sections.join('\n');
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
