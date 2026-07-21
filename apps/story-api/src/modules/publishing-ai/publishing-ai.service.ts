import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AiPublishDto } from './dto/ai-publish.dto';
import type { AiPublishResponseDto } from './dto/ai-publish-response.dto';

@Injectable()
export class PublishingAiService {
  private readonly publications = new Map<string, { id: string; storyId: string; status: string; createdAt: Date }>();

  async publish(dto: AiPublishDto): Promise<AiPublishResponseDto> {
    const id = randomUUID();
    const record = { id, storyId: dto.storyId, status: 'processing', createdAt: new Date() };
    this.publications.set(id, record);
    return { id: record.id, storyId: record.storyId, status: record.status, createdAt: record.createdAt.toISOString() };
  }

  async getStatus(id: string): Promise<AiPublishResponseDto | null> {
    const record = this.publications.get(id);
    if (!record) return null;
    return { id: record.id, storyId: record.storyId, status: record.status, createdAt: record.createdAt.toISOString() };
  }
}
