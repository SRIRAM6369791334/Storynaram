import { Injectable, Logger } from '@nestjs/common';

export interface JobStatus {
  id: string;
  name: string;
  status: 'completed' | 'failed' | 'active' | 'waiting' | 'delayed';
  progress: number;
  data?: Record<string, unknown>;
  result?: unknown;
  failedReason?: string;
  createdAt: Date;
  completedAt?: Date;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private readonly jobs = new Map<string, JobStatus>();

  trackJob(job: JobStatus): void {
    this.jobs.set(job.id, job);
    this.logger.debug(`Tracking job ${job.id}: ${job.name} [${job.status}]`);
  }

  updateJob(id: string, updates: Partial<JobStatus>): void {
    const existing = this.jobs.get(id);
    if (existing) {
      Object.assign(existing, updates);
    }
  }

  getJob(id: string): JobStatus | undefined {
    return this.jobs.get(id);
  }

  getQueuedJobs(): JobStatus[] {
    return Array.from(this.jobs.values()).filter(j => j.status === 'waiting' || j.status === 'delayed' || j.status === 'active');
  }

  getCompletedJobs(): JobStatus[] {
    return Array.from(this.jobs.values()).filter(j => j.status === 'completed');
  }

  getFailedJobs(): JobStatus[] {
    return Array.from(this.jobs.values()).filter(j => j.status === 'failed');
  }
}
