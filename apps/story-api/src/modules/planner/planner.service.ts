import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PlanStoryDto } from './dto/plan-story.dto.js';
import type { PlanResponseDto } from './dto/plan-response.dto.js';

@Injectable()
export class PlannerService {
  private readonly plans = new Map<string, { id: string; storyId: string; status: string; createdAt: Date }>();

  async plan(dto: PlanStoryDto): Promise<PlanResponseDto> {
    const id = randomUUID();
    const record = { id, storyId: dto.storyId, status: 'planned', createdAt: new Date() };
    this.plans.set(id, record);
    return { id: record.id, storyId: record.storyId, status: record.status, createdAt: record.createdAt.toISOString() };
  }

  async getStatus(id: string): Promise<PlanResponseDto | null> {
    const record = this.plans.get(id);
    if (!record) return null;
    return { id: record.id, storyId: record.storyId, status: record.status, createdAt: record.createdAt.toISOString() };
  }
}
