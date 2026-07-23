import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { randomUUID } from 'crypto';
import { GenerateStoryDto } from './dto/generate-story.dto.js';
import { GenerationResponseDto } from './dto/generation-response.dto.js';
import { JobsService, type StreamEventPayload } from '../../jobs/jobs.service.js';

type StreamEventCallback = (event: string, data: Record<string, unknown>) => void;

@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);

  constructor(
    @InjectQueue('story-generation') private readonly queue: Queue,
    private readonly jobsService: JobsService,
  ) {}

  async generate(dto: GenerateStoryDto): Promise<GenerationResponseDto> {
    const generationId = randomUUID();
    const now = new Date();

    this.jobsService.trackJob({
      id: generationId,
      name: 'story-generation',
      status: 'queued',
      progress: 0,
      data: { storyId: dto.storyId, options: dto.options },
      createdAt: now,
    });

    const job = await this.queue.add(
      'generate',
      {
        generationId,
        storyId: dto.storyId,
        title: dto.title,
        chapters: dto.chapters,
        model: dto.model,
        provider: dto.provider,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
        metadata: dto.options,
        timestamp: now.toISOString(),
      },
      {
        jobId: generationId,
        priority: 0,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 3600 * 24 },
        removeOnFail: { age: 3600 * 24 },
      },
    );

    this.logger.log(`Enqueued generation ${generationId} for story ${dto.storyId} (job ${job.id})`);

    return {
      id: generationId,
      storyId: dto.storyId,
      status: 'queued',
      createdAt: now.toISOString(),
    };
  }

  async generateStream(
    dto: GenerateStoryDto,
    emit: StreamEventCallback,
  ): Promise<void> {
    const generationId = randomUUID();
    const now = new Date();

    emit('connected', { generationId, storyId: dto.storyId });

    this.jobsService.trackJob({
      id: generationId,
      name: 'story-generation',
      status: 'queued',
      progress: 0,
      data: { storyId: dto.storyId },
      createdAt: now,
    });

    emit('started', { generationId, storyId: dto.storyId, status: 'queued' });

    const job = await this.queue.add(
      'generate',
      {
        generationId,
        storyId: dto.storyId,
        title: dto.title,
        chapters: dto.chapters,
        model: dto.model,
        provider: dto.provider,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
        metadata: dto.options,
        timestamp: now.toISOString(),
        stream: true,
      },
      {
        jobId: generationId,
        priority: 0,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 3600 * 24 },
        removeOnFail: { age: 3600 * 24 },
      },
    );

    this.logger.log(`Stream enqueued generation ${generationId} for story ${dto.storyId} (job ${job.id})`);

    await this.forwardStreamEvents(generationId, emit);
  }

  private async forwardStreamEvents(
    generationId: string,
    emit: StreamEventCallback,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        emit('failed', { generationId, error: 'Generation timed out after 30 minutes' });
        reject(new Error('Generation timed out'));
      }, 30 * 60 * 1000);

      const onUpdate = (status: { status: string; progress: number; result?: Record<string, unknown>; failedReason?: string }) => {
        emit('progress', { generationId, status: status.status, progress: status.progress });

        if (status.status === 'completed') {
          cleanup();
          emit('completed', {
            generationId,
            result: status.result,
          });
          resolve();
        }

        if (status.status === 'failed') {
          cleanup();
          emit('failed', { generationId, error: status.failedReason ?? 'Generation failed' });
          reject(new Error(status.failedReason ?? 'Generation failed'));
        }

        if (status.status === 'cancelled') {
          cleanup();
          emit('cancelled', { generationId });
          resolve();
        }
      };

      const onStreamEvent = (payload: StreamEventPayload) => {
        switch (payload.type) {
          case 'token':
            emit('token', {
              generationId: payload.generationId,
              chapterNumber: payload.chapterNumber,
              delta: payload.delta,
              index: payload.index,
              finishReason: payload.finishReason,
              latencyMs: payload.latencyMs,
              timeToFirstTokenMs: payload.timeToFirstTokenMs,
            });
            break;

          case 'chapter:start':
            emit('chapter', {
              generationId: payload.generationId,
              chapterNumber: payload.chapterNumber,
              chapterTitle: payload.chapterTitle,
              action: 'start',
            });
            break;

          case 'chapter:complete':
            emit('chapter', {
              generationId: payload.generationId,
              chapterNumber: payload.chapterNumber,
              chapterTitle: payload.chapterTitle,
              action: 'complete',
              content: payload.content,
              tokenUsage: payload.tokenUsage,
              latencyMs: payload.latencyMs,
              timeToFirstTokenMs: payload.timeToFirstTokenMs,
            });
            break;

          case 'quality:check':
            emit('progress', {
              generationId: payload.generationId,
              status: 'validating',
              checks: payload.checks,
            });
            break;

          case 'metrics':
            emit('progress', {
              generationId: payload.generationId,
              status: 'metrics',
              metrics: payload.metrics,
            });
            break;

          case 'error':
            cleanup();
            emit('failed', { generationId: payload.generationId, error: payload.error });
            reject(new Error(payload.error));
            break;

          case 'done':
            break;
        }
      };

      const cleanup = () => {
        clearTimeout(timeout);
        this.jobsService.events.removeListener(`job:${generationId}:updated`, onUpdate);
        this.jobsService.events.removeListener(`job:${generationId}:stream`, onStreamEvent);
      };

      this.jobsService.events.on(`job:${generationId}:updated`, onUpdate);
      this.jobsService.events.on(`job:${generationId}:stream`, onStreamEvent);

      const current = this.jobsService.getJob(generationId);
      if (current && (current.status === 'completed' || current.status === 'failed' || current.status === 'cancelled')) {
        cleanup();
        if (current.status === 'completed') {
          emit('completed', { generationId, result: current.result });
          resolve();
        } else if (current.status === 'cancelled') {
          emit('cancelled', { generationId });
          resolve();
        } else {
          emit('failed', { generationId, error: current.failedReason ?? 'Generation failed' });
          reject(new Error(current.failedReason ?? 'Generation failed'));
        }
      }
    });
  }

  async getStatus(id: string): Promise<GenerationResponseDto | null> {
    const record = this.jobsService.getJob(id);
    if (!record) return null;

    const bullJob = await this.queue.getJob(id);

    return {
      id: record.id,
      storyId: (record.data?.storyId as string) ?? '',
      status: record.status,
      createdAt: record.createdAt.toISOString(),
      startedAt: record.startedAt?.toISOString(),
      completedAt: record.completedAt?.toISOString(),
      error: record.failedReason,
      chapters: record.result?.chapters as never,
      fullStory: record.result?.fullStory as string | undefined,
      qualityPassed: record.result?.qualityPassed as boolean | undefined,
      metrics: record.result?.metrics as never,
      progress: record.progress,
      retryAttempt: bullJob?.attemptsMade,
    };
  }

  async cancel(id: string): Promise<boolean> {
    const job = await this.queue.getJob(id);
    if (!job) return false;

    if (await job.isActive() || await job.isWaiting()) {
      await job.remove();
      this.jobsService.updateJob(id, { status: 'cancelled', completedAt: new Date() });
      this.jobsService.emitStreamEvent({
        type: 'error',
        generationId: id,
        error: 'Generation cancelled by user',
      });
      this.logger.log(`Cancelled generation ${id}`);
      return true;
    }
    return false;
  }
}
