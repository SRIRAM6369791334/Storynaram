import type { GenerationResult } from '@storynaram/story-generator';
import type { ExecutionResult } from '@storynaram/narrative-execution';
import { RevisionSession } from '../types/revision-session.js';
import type { RevisionStatus } from '../types/revision-session.js';
import type { RevisionOptions, RevisionPassType, RevisionContext } from '../types/revision-context.js';
import { RevisionPipeline } from '../types/revision-pipeline.js';
import { RevisionResult, type RevisedChapter } from '../types/revision-result.js';
import { RevisionMemory } from '../types/revision-memory.js';
import { RevisionStatistics } from '../types/revision-statistics.js';
import type { RevStats } from '../types/revision-statistics.js';
import { createCheckpoint } from '../types/revision-checkpoint.js';
import { RevisionReport, type QualityScoreReport, type PassReport, type QualityScoreReport as QSR } from '../types/revision-report.js';
import { GrammarAgent } from '../agents/grammar-agent.js';
import { CharacterReviewAgent } from '../agents/character-review-agent.js';
import { WorldReviewAgent } from '../agents/world-review-agent.js';
import { TimelineReviewAgent } from '../agents/timeline-review-agent.js';
import { CanonReviewAgent } from '../agents/canon-review-agent.js';
import { NarrativeReviewAgent } from '../agents/narrative-review-agent.js';
import { PlotReviewAgent } from '../agents/plot-review-agent.js';
import { StyleReviewAgent } from '../agents/style-review-agent.js';
import { QualityReviewAgent } from '../agents/quality-review-agent.js';
import { RevisionAgent, type RevisionAgentResult } from '../agents/revision-agent.js';
import { StoryQualityScore, type StoryQualityScoreParams, type QualityScores } from '../quality/story-quality-score.js';
import { ImprovementApplier } from '../improvement/improvement-applier.js';

export interface RevisionEngineOptions {
  passes?: RevisionPassType[];
  autoFix?: boolean;
  generateReport?: boolean;
  strictMode?: boolean;
  maxIterations?: number;
}

export interface EngineHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  activeSessions: number;
  totalRevisions: number;
  failedRevisions: number;
}

const DEFAULT_PASSES: RevisionPassType[] = ['grammar', 'character', 'world', 'timeline', 'canon', 'narrative', 'plot', 'style', 'quality'];

const AGENTS: Record<RevisionPassType, RevisionAgent> = {
  grammar: new GrammarAgent(),
  character: new CharacterReviewAgent(),
  world: new WorldReviewAgent(),
  timeline: new TimelineReviewAgent(),
  canon: new CanonReviewAgent(),
  narrative: new NarrativeReviewAgent(),
  plot: new PlotReviewAgent(),
  style: new StyleReviewAgent(),
  quality: new QualityReviewAgent(),
};

export class RevisionEngine {
  private activeSessions: Map<string, RevisionSession> = new Map();
  private totalRevisions: number = 0;
  private failedRevisions: number = 0;
  private readonly options: RevisionEngineOptions;

  private qualityScorer = new StoryQualityScore();

  constructor(options?: Partial<RevisionEngineOptions>) {
    this.options = {
      passes: options?.passes ?? DEFAULT_PASSES,
      autoFix: options?.autoFix ?? false,
      generateReport: options?.generateReport ?? true,
      strictMode: options?.strictMode ?? false,
      maxIterations: options?.maxIterations ?? 1,
    };
  }

  async revise(
    generationResult: GenerationResult,
    executionResult?: ExecutionResult,
    userOptions?: Partial<RevisionOptions>,
    signal?: AbortSignal,
  ): Promise<RevisionResult> {
    const sessionId = crypto.randomUUID();
    const passes: RevisionPassType[] = userOptions?.passes ?? this.options.passes ?? DEFAULT_PASSES;
    const autoFix: boolean = userOptions?.autoFix ?? this.options.autoFix ?? false;
    const maxIterations: number = userOptions?.maxIterations ?? this.options.maxIterations ?? 1;

    const options: RevisionOptions = {
      passes,
      autoFix,
      generateReport: userOptions?.generateReport ?? this.options.generateReport ?? true,
      maxIterations,
      strictMode: userOptions?.strictMode ?? this.options.strictMode ?? false,
    };

    const context: RevisionContext = {
      sessionId,
      generationResult,
      executionResult,
      abortSignal: signal,
      options,
    };

    const session = new RevisionSession({ sessionId, generationResult, context });
    this.activeSessions.set(sessionId, session);
    this.totalRevisions++;

    const pipeline = new RevisionPipeline();
    pipeline.addStage('analyze', 'quality');
    pipeline.addStage('detect', 'quality');

    for (const pass of passes) {
      pipeline.addStage(`pass-${pass}`, pass);
    }

    pipeline.addStage('apply-fixes', 'quality');
    pipeline.addStage('validate', 'quality');
    pipeline.addStage('generate-reports', 'quality');

    try {
      session.status = 'analyzing';
      session.statistics.start();
      pipeline.startStage('analyze');

      const chapters = generationResult.chapters.map(ch => ({
        number: ch.number,
        title: ch.title,
        content: ch.content,
        wordCount: ch.wordCount,
      }));

      const draft = executionResult?.storyDraft;
      const expectedCharacters = draft?.characters.map(c => c.name) ?? [];
      const worldNames = draft?.worlds.map(w => w.name) ?? [];
      const timelineDesc = draft?.timeline?.overallTimeline ?? '';

      const qualityBefore = this.scoreCurrentStory(chapters);
      pipeline.completeStage('analyze', 0, 0);

      session.status = 'detecting';
      pipeline.startStage('detect');
      pipeline.completeStage('detect', 0, 0);

      session.status = 'running-passes';
      let currentContent = this.buildFullText(chapters);
      let currentChapters = [...chapters];
      const passReports: PassReport[] = [];
      const allIssues: import('../types/revision-report').IssueReport[] = [];

      for (const pass of passes) {
        if (signal?.aborted) throw new DOMException('Revision cancelled', 'AbortError');

        const agent = AGENTS[pass];
        if (!agent) continue;

        pipeline.startStage(`pass-${pass}`);
        const passStartTime = Date.now();

        const passResults: RevisionAgentResult[] = [];
        for (const chapter of currentChapters) {
          const agentContext: Record<string, unknown> = {
            autoFix,
            expectedCharacters,
            worldNames,
            timeline: timelineDesc,
            storyTimeline: timelineDesc,
            characterTraits: this.buildCharacterTraits(draft),
            canonFacts: [],
            canonEvents: draft?.timeline?.events.map(e => e.title) ?? [],
            canonHistory: [],
            foreshadowElements: [],
            conflictElements: [],
            arcElements: draft?.composition?.arcs.map(a => a.name) ?? [],
            worldMagic: draft?.worlds[0]?.description?.includes('magic') ? 'high' : 'low',
            worldTech: draft?.worlds[0]?.description?.includes('technology') ? 'high' : 'low',
            qualityParams: this.buildQualityParams(currentContent, currentChapters, expectedCharacters, worldNames),
          };

          const result = await agent.execute(chapter.content, chapter.number, agentContext);
          passResults.push(result);
          allIssues.push(...result.issuesFound);
        }

        const totalIssuesFound = passResults.reduce((s, r) => s + r.issuesFound.length, 0);
        const totalResolved = passResults.reduce((s, r) => s + r.issuesResolved, 0);
        const passDuration = Date.now() - passStartTime;

        for (let i = 0; i < currentChapters.length; i++) {
          if (passResults[i]?.revisedContent) {
            currentChapters[i] = {
              ...currentChapters[i]!,
              content: passResults[i]!.revisedContent!,
            };
          }
          session.memory.record({
            passName: pass,
            chapterNumber: currentChapters[i]!.number,
            original: '',
            revised: passResults[i]?.revisedContent ?? currentChapters[i]!.content,
            changes: passResults[i]?.issuesResolved ?? 0,
            issues: passResults[i]?.issuesFound.map(iss => iss.description) ?? [],
            timestamp: new Date(),
          });
        }

        session.statistics.recordPass(pass, passDuration, totalIssuesFound, totalResolved);

        pipeline.completeStage(`pass-${pass}`, totalIssuesFound, totalResolved);

        const passReport: PassReport = {
          passType: pass,
          name: agent.name,
          passed: passResults.every(r => r.passed),
          issuesFound: totalIssuesFound,
          issuesResolved: totalResolved,
          durationMs: passDuration,
          details: passResults.flatMap(r => r.details),
        };
        passReports.push(passReport);

        session.memory.addCheckpoint(JSON.stringify(currentChapters));
      }

      currentContent = this.buildFullText(currentChapters);

      session.status = 'applying-fixes';
      pipeline.startStage('apply-fixes');
      if (autoFix) {
        const applier = new ImprovementApplier();
        const fixResult = applier.applyAutoFixAll(currentContent);
        if (fixResult.changes > 0) {
          currentContent = fixResult.content;
          const fixedChapters = this.splitToChapters(currentContent, currentChapters.map(c => c.title));
          for (let i = 0; i < currentChapters.length && i < fixedChapters.length; i++) {
            currentChapters[i] = { ...currentChapters[i]!, content: fixedChapters[i]! };
          }
        }
      }
      pipeline.completeStage('apply-fixes', allIssues.length, autoFix ? allIssues.length : 0);

      session.status = 'validating';
      pipeline.startStage('validate');
      const qualityAfter = this.scoreCurrentStory(currentChapters);
      session.statistics.setQualityScores(qualityBefore.overall, qualityAfter.overall);
      pipeline.completeStage('validate', 0, 0);

      session.status = 'generating-reports';
      pipeline.startStage('generate-reports');
      const revisedChapters: RevisedChapter[] = chapters.map((orig, i) => {
        const current = currentChapters[i]!;
        const applier = new ImprovementApplier();
        const diff = applier.generateDiff(orig.content, current.content);
        const chapterIssues = allIssues.filter(iss => iss.chapterNumber === orig.number);
        return {
          number: orig.number,
          originalTitle: orig.title,
          originalContent: orig.content,
          revisedContent: current.content,
          changes: diff.additions + diff.deletions + diff.modifications,
          issuesFound: chapterIssues.length,
          issuesResolved: chapterIssues.filter(iss => iss.resolved).length,
          qualityImprovement: qualityAfter.overall - qualityBefore.overall,
        };
      });

      const report = this.buildReport(passReports, qualityAfter);
      pipeline.completeStage('generate-reports', allIssues.length, autoFix ? allIssues.length : 0);

      session.status = 'completed';
      session.completedAt = new Date();

      const revisedFullStory = currentChapters.map(ch => `# ${ch.title}\n\n${ch.content}`).join('\n\n');

      const result = new RevisionResult({
        sessionId,
        storyTitle: generationResult.storyTitle,
        originalFullStory: generationResult.fullStory,
        revisedFullStory,
        chapters: revisedChapters,
        revisionReport: report,
        statistics: session.statistics,
      });

      this.activeSessions.delete(sessionId);
      return result;
    } catch (error) {
      session.status = 'failed';
      session.error = error instanceof Error ? error.message : String(error);
      session.completedAt = new Date();
      this.failedRevisions++;
      this.activeSessions.delete(sessionId);
      throw error;
    }
  }

  private scoreCurrentStory(chapters: Array<{ number: number; title: string; content: string; wordCount: number }>): QualityScores {
    return this.qualityScorer.calculate(this.buildQualityParams(
      this.buildFullText(chapters),
      chapters,
      [],
      [],
    ));
  }

  private buildFullText(chapters: Array<{ number: number; title: string; content: string; wordCount: number }>): string {
    return chapters.map(ch => `# ${ch.title}\n\n${ch.content}`).join('\n\n');
  }

  private splitToChapters(fullText: string, titles: string[]): string[] {
    const result: string[] = [];
    for (const title of titles) {
      const pattern = new RegExp(`#\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n\\n`, 'i');
      const splitContent = fullText.split(pattern as unknown as string);
      if (splitContent.length > 1) {
        result.push(splitContent[1] ?? '');
        fullText = splitContent.slice(1).join('');
      } else {
        result.push(fullText);
      }
    }
    return result;
  }

  private buildCharacterTraits(draft: { characters?: Array<{ name: string; role: string }> } | undefined): Record<string, string[]> {
    if (!draft?.characters) return {};
    const traits: Record<string, string[]> = {};
    for (const char of draft.characters) {
      traits[char.name] = [char.role];
    }
    return traits;
  }

  private buildQualityParams(
    content: string,
    chapters: Array<{ number: number; title: string; content: string; wordCount: number }>,
    expectedCharacters: string[],
    worldNames: string[],
  ): StoryQualityScoreParams {
    const allContent = content;
    const sentences = allContent.match(/[^.!?\n]+[.!?](\s|$)/g) ?? [];
    const words = allContent.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((s, w) => s + this.countSyllables(w), 0);
    const dialogueLines = (allContent.match(/"[^"]*"/g) ?? []).length;
    const totalWords = words.length;
    const totalSentences = sentences.length;

    const characterMentions = new Map<string, number>();
    for (const name of expectedCharacters) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(escaped, 'gi');
      const mentions = allContent.match(pattern);
      characterMentions.set(name, mentions?.length ?? 0);
    }

    const magicPattern = /\b(magic|spell|enchant|wizard|sorcer|arcane|mystical)\b/gi;
    const techPattern = /\b(technology|machine|robot|cyber|digital|quantum|laser)\b/gi;
    const culturePattern = /\b(culture|tradition|custom|ritual|ceremony|festival|heritage)\b/gi;
    const envPattern = /\b(forest|mountain|river|ocean|desert|city|village|temple|castle|cave|landscape|terrain)\b/gi;
    const locationPattern = /\b(kingdom|realm|region|district|province|capital|fortress|harbor|square|tavern)\b/gi;

    return {
      character: {
        presentCharacters: expectedCharacters.filter(c => characterMentions.get(c ?? '') ?? 0 > 0),
        expectedCharacters,
        dialogueProportions: totalWords > 0 ? dialogueLines * 10 / totalWords : 0,
        characterMentions,
        characterTraits: new Map(),
      },
      world: {
        worldNames,
        locationCount: (allContent.match(locationPattern) ?? []).length,
        cultureMentions: (allContent.match(culturePattern) ?? []).length,
        magicMentions: (allContent.match(magicPattern) ?? []).length,
        technologyMentions: (allContent.match(techPattern) ?? []).length,
        environmentMentions: (allContent.match(envPattern) ?? []).length,
        consistencyIssues: [],
      },
      timeline: {
        totalEvents: 1,
        chronologicalOrder: true,
        flashbackCount: (allContent.match(/\b(flashback|remembered|recalled|earlier|previously)\b/gi) ?? []).length,
        timeJumpCount: (allContent.match(/\b(\d+ (years?|months?|weeks?|days?) (later|earlier|before|after))\b/gi) ?? []).length,
        ageConsistencyIssues: [],
        temporalContradictions: [],
      },
      canon: {
        factViolations: [],
        referenceErrors: [],
        eventContradictions: [],
        historyInconsistencies: [],
        relationshipErrors: [],
      },
      narrative: {
        pacingIssues: [],
        flowIssues: [],
        transitionIssues: [],
        sceneOrderIssues: [],
        chapterOrderIssues: [],
        chapterCount: chapters.length,
        avgChapterWordCount: chapters.length > 0 ? chapters.reduce((s, c) => s + c.wordCount, 0) / chapters.length : 0,
      },
      dialogue: {
        totalDialogueLines: dialogueLines,
        uniqueSpeakers: expectedCharacters.length,
        dialogueProportion: totalWords > 0 ? dialogueLines * 10 / totalWords : 0,
        weakTags: [],
        repetitiveTags: [],
        dialogueLengthIssues: [],
      },
      readability: {
        totalWords,
        totalSentences,
        totalSyllables: syllables,
        complexWords: words.filter(w => this.countSyllables(w) > 2).length,
        avgSentenceLength: totalSentences > 0 ? totalWords / totalSentences : 0,
        paragraphCount: (allContent.match(/\n\n/g) ?? []).length + 1,
      },
      emotion: {
        emotionalWords: (allContent.match(/\b(love|hate|fear|joy|anger|sorrow|hope|despair|courage|grief|passion|wonder|awe|dread|longing|ecstasy|rage|terror|bliss)\b/gi) ?? []).length,
        totalWords,
        emotionalVariety: 3,
        positiveRatio: 0.5,
        negativeRatio: 0.3,
        intenseEmotions: (allContent.match(/\b(ecstasy|rage|terror|bliss|despair|euphoria)\b/gi) ?? []).length,
      },
      consistency: {
        characterInconsistencies: [],
        worldInconsistencies: [],
        timelineInconsistencies: [],
        plotInconsistencies: [],
        styleInconsistencies: [],
      },
    };
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    const vowels = word.match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 0;
    if (word.endsWith('e')) count--;
    if (word.endsWith('le') && word.length > 2 && !'aeiouy'.includes(word[word.length - 3] ?? '')) count++;
    if (word.endsWith('es') || word.endsWith('ed')) count--;
    return Math.max(1, count);
  }

  private buildReport(passReports: PassReport[], qualityScores: QualityScores): RevisionReport {
    const totalFound = passReports.reduce((s, r) => s + r.issuesFound, 0);
    const totalResolved = passReports.reduce((s, r) => s + r.issuesResolved, 0);

    const qualityReport: QualityScoreReport = {
      overall: qualityScores.overall,
      character: qualityScores.character,
      timeline: qualityScores.timeline,
      canon: qualityScores.canon,
      narrative: qualityScores.narrative,
      dialogue: qualityScores.dialogue,
      grammar: qualityScores.readability,
      style: qualityScores.emotion,
    };

    return {
      summary: `${passReports.length} passes completed. Found ${totalFound} issues, resolved ${totalResolved}. Overall quality: ${qualityScores.overall}/100`,
      passed: totalFound === 0 || totalFound === totalResolved,
      passes: passReports,
      qualityScores: qualityReport,
      issues: [],
      improvements: [],
    };
  }

  getHealth(): EngineHealth {
    return {
      status: this.failedRevisions > this.totalRevisions * 0.5 ? 'degraded' : 'healthy',
      activeSessions: this.activeSessions.size,
      totalRevisions: this.totalRevisions,
      failedRevisions: this.failedRevisions,
    };
  }

  getSession(sessionId: string): RevisionSession | undefined {
    return this.activeSessions.get(sessionId);
  }
}
