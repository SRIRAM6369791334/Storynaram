import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ReviseStoryDto } from './dto/revise-story.dto.js';
import type { RevisionResponseDto } from './dto/revision-response.dto.js';

@Injectable()
export class RevisionService {
  private readonly revisions = new Map<string, { id: string; storyId: string; status: string; createdAt: Date }>();

  async revise(dto: ReviseStoryDto): Promise<RevisionResponseDto> {
    const id = randomUUID();
    const record = { id, storyId: dto.storyId, status: 'queued', createdAt: new Date() };
    this.revisions.set(id, record);
    return { id: record.id, storyId: record.storyId, status: record.status, createdAt: record.createdAt.toISOString() };
  }

  async getStatus(id: string): Promise<RevisionResponseDto | null> {
    const record = this.revisions.get(id);
    if (!record) return null;
    return { id: record.id, storyId: record.storyId, status: record.status, createdAt: record.createdAt.toISOString() };
  }
}
