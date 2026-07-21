import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { StoryGenerationEngine } from '@storynaram/story-generator';
import { ExecutionResult } from '@storynaram/narrative-execution';
import type { StoryDraft, ChapterDraft, ExecutionReport, ValidationReport } from '@storynaram/narrative-execution';
import { GenerateStoryDto, ChapterInputDto } from './dto/generate-story.dto';
import { GenerationResponseDto, GeneratedChapterDto, GenerationMetricsDto } from './dto/generation-response.dto';

type StreamEventCallback = (event: string, data: Record<string, unknown>) => void;

interface GenerationRecord {
  id: string;
  storyId: string;
  status: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  chapters?: GeneratedChapterDto[];
  fullStory?: string;
  qualityPassed?: boolean;
  metrics?: GenerationMetricsDto;
}

@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);
  private readonly generations = new Map<string, GenerationRecord>();

  constructor(private readonly engine: StoryGenerationEngine) {}

  async generate(dto: GenerateStoryDto): Promise<GenerationResponseDto> {
    const id = randomUUID();
    const record: GenerationRecord = {
      id,
      storyId: dto.storyId,
      status: 'queued',
      createdAt: new Date(),
    };
    this.generations.set(id, record);

    this.processGeneration(id, dto).catch((err) => {
      this.logger.error(`Generation ${id} failed: ${err.message}`);
      record.status = 'failed';
      record.error = err.message;
      record.completedAt = new Date();
    });

    return this.toResponse(record);
  }

  async generateStream(
    dto: GenerateStoryDto,
    emit: StreamEventCallback,
  ): Promise<void> {
    const id = randomUUID();

    emit('start', { generationId: id, storyId: dto.storyId });

    try {
      const executionResult = this.buildExecutionResult(dto);
      emit('progress', { stage: 'generating' });

      const result = await this.engine.generate(executionResult, {
        model: dto.model,
        provider: dto.provider,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
        stream: dto.stream ?? true,
      });

      for (const chapter of result.chapters) {
        emit('chapter', {
          number: chapter.number,
          title: chapter.title,
          content: chapter.content,
          wordCount: chapter.wordCount,
        });
      }

      emit('complete', {
        sessionId: result.sessionId,
        chaptersGenerated: result.metrics.chaptersGenerated,
        totalTokens: result.metrics.totalTokens,
        totalCost: result.metrics.totalCost,
        qualityPassed: result.qualityReport.passed,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      emit('error', { message });
    }
  }

  async getStatus(id: string): Promise<GenerationResponseDto | null> {
    const record = this.generations.get(id);
    if (!record) return null;
    return this.toResponse(record);
  }

  private buildExecutionResult(dto: GenerateStoryDto): ExecutionResult {
    const chapters: ChapterDraft[] = (dto.chapters ?? [{ number: 1, title: 'Chapter 1' }]).map(
      (c: ChapterInputDto) => ({
        number: c.number,
        title: c.title,
        content: '',
        wordCount: 0,
      }),
    );

    const storyDraft: StoryDraft = {
      title: dto.title ?? 'Untitled Story',
      chapters,
      characters: [],
      worlds: [],
      timeline: { events: [], overallTimeline: '' },
      narrative: { synopsis: '', chapters: [] },
      composition: { arcs: [], overallStructure: '' },
      validationResults: [],
      metadata: { storyId: dto.storyId },
    };

    const executionReport: ExecutionReport = {
      sessionId: randomUUID(),
      status: 'completed',
      stages: [],
      totalDurationMs: 0,
      totalTokens: 0,
      model: dto.model ?? 'mock-model',
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

  private async processGeneration(id: string, dto: GenerateStoryDto): Promise<void> {
    const record = this.generations.get(id);
    if (!record) return;

    try {
      const executionResult = this.buildExecutionResult(dto);
      const result = await this.engine.generate(executionResult, {
        model: dto.model,
        provider: dto.provider,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
        stream: dto.stream,
      });

      record.status = 'completed';
      record.completedAt = result.completedAt;
      record.chapters = result.chapters.map((ch) => ({
        number: ch.number,
        title: ch.title,
        content: ch.content,
        wordCount: ch.wordCount,
        model: ch.model,
        provider: ch.provider,
        latencyMs: ch.latencyMs,
      }));
      record.fullStory = result.fullStory;
      record.qualityPassed = result.qualityReport.passed;
      record.metrics = {
        totalDurationMs: result.metrics.totalDurationMs,
        totalTokens: result.metrics.totalTokens,
        totalCost: result.metrics.totalCost,
        chaptersGenerated: result.metrics.chaptersGenerated,
        averageLatencyMs: result.metrics.averageLatencyMs,
        modelsUsed: result.metrics.modelsUsed,
        providersUsed: result.metrics.providersUsed,
      };
    } catch (err) {
      record.status = 'failed';
      record.error = err instanceof Error ? err.message : String(err);
      record.completedAt = new Date();
    }
  }

  private toResponse(record: GenerationRecord): GenerationResponseDto {
    return {
      id: record.id,
      storyId: record.storyId,
      status: record.status,
      createdAt: record.createdAt.toISOString(),
      completedAt: record.completedAt?.toISOString(),
      error: record.error,
      chapters: record.chapters,
      fullStory: record.fullStory,
      qualityPassed: record.qualityPassed,
      metrics: record.metrics,
    };
  }
}
