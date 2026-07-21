import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';

export interface StreamEventPayload {
  type: 'token' | 'chapter:start' | 'chapter:complete' | 'quality:check' | 'metrics' | 'error' | 'connected' | 'started' | 'done';
  generationId: string;
  chapterNumber?: number;
  chapterTitle?: string;
  delta?: string;
  content?: string;
  index?: number;
  finishReason?: string | null;
  latencyMs?: number;
  timeToFirstTokenMs?: number;
  tokenUsage?: { inputTokens: number; outputTokens: number; totalTokens: number };
  checks?: Array<{ name: string; passed: boolean; score: number; issues: string[] }>;
  metrics?: Record<string, unknown>;
  error?: string;
  message?: string;
}

export interface JobStatus {
  id: string;
  name: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'delayed';
  progress: number;
  data?: Record<string, unknown>;
  result?: Record<string, unknown>;
  failedReason?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private readonly jobs = new Map<string, JobStatus>();
  private readonly _eventBus = new EventEmitter();

  constructor() {
    this._eventBus.setMaxListeners(100);
  }

  get events(): EventEmitter {
    return this._eventBus;
  }

  trackJob(job: JobStatus): void {
    this.jobs.set(job.id, job);
    this.logger.debug(`Tracking job ${job.id}: ${job.name} [${job.status}]`);
  }

  updateJob(id: string, updates: Partial<JobStatus>): void {
    const existing = this.jobs.get(id);
    if (existing) {
      Object.assign(existing, updates);
      this.events.emit(`job:${id}:updated`, existing);
    }
  }

  emitStreamEvent(event: StreamEventPayload): void {
    this.events.emit(`job:${event.generationId}:stream`, event);
  }

  getJob(id: string): JobStatus | undefined {
    return this.jobs.get(id);
  }

  getQueuedJobs(): JobStatus[] {
    return Array.from(this.jobs.values()).filter(j => j.status === 'queued' || j.status === 'processing');
  }

  getCompletedJobs(): JobStatus[] {
    return Array.from(this.jobs.values()).filter(j => j.status === 'completed');
  }

  getFailedJobs(): JobStatus[] {
    return Array.from(this.jobs.values()).filter(j => j.status === 'failed');
  }
}
