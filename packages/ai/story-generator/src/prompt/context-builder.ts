import type { ExecutionResult, StoryDraft, ChapterDraft } from '@storynaram/narrative-execution';
import type { GenerationOptions } from '../generation-context';

export interface GenerationContextData {
  storyDraft: StoryDraft;
  chapter: ChapterDraft;
  previousContent: string;
  characterContext: string;
  worldContext: string;
  timelineContext: string;
  compositionContext: string;
  metadata: Record<string, unknown>;
}

export class ContextBuilder {
  buildForChapter(result: ExecutionResult, chapter: ChapterDraft, previousContent: string): GenerationContextData {
    return {
      storyDraft: result.storyDraft,
      chapter,
      previousContent,
      characterContext: this.buildCharacterContext(result.storyDraft),
      worldContext: this.buildWorldContext(result.storyDraft),
      timelineContext: this.buildTimelineContext(result.storyDraft),
      compositionContext: this.buildCompositionContext(result.storyDraft),
      metadata: {
        sessionId: result.sessionId,
        title: result.storyDraft.title,
        chapterNumber: chapter.number,
        totalChapters: result.storyDraft.chapters.length,
        validationPassed: result.validationReport.passed,
      },
    };
  }

  buildFullContext(result: ExecutionResult): GenerationContextData {
    const firstChapter = result.storyDraft.chapters[0];
    if (firstChapter) {
      return this.buildForChapter(result, firstChapter, '');
    }
    return {
      storyDraft: result.storyDraft,
      chapter: { number: 1, title: 'Story', content: '', wordCount: 0 },
      previousContent: '',
      characterContext: this.buildCharacterContext(result.storyDraft),
      worldContext: this.buildWorldContext(result.storyDraft),
      timelineContext: this.buildTimelineContext(result.storyDraft),
      compositionContext: this.buildCompositionContext(result.storyDraft),
      metadata: { sessionId: result.sessionId, title: result.storyDraft.title },
    };
  }

  private buildCharacterContext(draft: StoryDraft): string {
    if (draft.characters.length === 0) return 'No characters defined.';
    return draft.characters.map(c => {
      const parts = [`${c.name} (${c.role}): ${c.introduction}`];
      if (c.dialogue) parts.push(`  Voice: ${c.dialogue.slice(0, 100)}`);
      return parts.join('\n');
    }).join('\n');
  }

  private buildWorldContext(draft: StoryDraft): string {
    if (draft.worlds.length === 0) return 'No world settings defined.';
    return draft.worlds.map(w => `${w.name}: ${w.description.slice(0, 200)}`).join('\n');
  }

  private buildTimelineContext(draft: StoryDraft): string {
    const events = draft.timeline.events.map(e => `${e.date}: ${e.title} — ${e.narrative.slice(0, 100)}`).join('\n');
    return `Timeline: ${draft.timeline.overallTimeline.slice(0, 200)}\n${events}`;
  }

  private buildCompositionContext(draft: StoryDraft): string {
    const arcs = draft.composition.arcs.map(a => `${a.name}: ${a.content.slice(0, 100)}`).join('\n');
    return `Structure: ${draft.composition.overallStructure.slice(0, 200)}\n${arcs}`;
  }
}
