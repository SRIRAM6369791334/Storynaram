import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { GenerateStoryDto } from './dto/generate-story.dto';
import type { GenerationResponseDto } from './dto/generation-response.dto';

@Injectable()
export class GenerationService {
  private readonly generations = new Map<string, { id: string; storyId: string; status: string; createdAt: Date }>();

  async generate(dto: GenerateStoryDto): Promise<GenerationResponseDto> {
    const id = randomUUID();
    const record = { id, storyId: dto.storyId, status: 'queued', createdAt: new Date() };
    this.generations.set(id, record);
    return { id: record.id, storyId: record.storyId, status: record.status, createdAt: record.createdAt.toISOString() };
  }

  async getStatus(id: string): Promise<GenerationResponseDto | null> {
    const record = this.generations.get(id);
    if (!record) return null;
    return { id: record.id, storyId: record.storyId, status: record.status, createdAt: record.createdAt.toISOString() };
  }
}
