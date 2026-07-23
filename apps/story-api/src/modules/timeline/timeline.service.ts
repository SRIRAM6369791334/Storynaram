import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateTimelineDto } from './dto/create-timeline.dto.js';
import type { TimelineResponseDto } from './dto/timeline-response.dto.js';

interface TimelineRecord {
  id: string;
  name: string;
  description?: string;
  storyId?: string;
  createdAt: Date;
}

@Injectable()
export class TimelineService {
  private readonly timelines = new Map<string, TimelineRecord>();

  async create(dto: CreateTimelineDto): Promise<TimelineResponseDto> {
    const record: TimelineRecord = { id: randomUUID(), name: dto.name, description: dto.description, storyId: dto.storyId, createdAt: new Date() };
    this.timelines.set(record.id, record);
    return this.toDto(record);
  }

  async findAll(): Promise<TimelineResponseDto[]> {
    return Array.from(this.timelines.values()).map(t => this.toDto(t));
  }

  async findByStoryId(storyId: string): Promise<TimelineResponseDto[]> {
    return Array.from(this.timelines.values())
      .filter(t => t.storyId === storyId)
      .map(t => this.toDto(t));
  }

  async findById(id: string): Promise<TimelineResponseDto> {
    const record = this.timelines.get(id);
    if (!record) throw new NotFoundException(`Timeline ${id} not found`);
    return this.toDto(record);
  }

  async delete(id: string): Promise<void> {
    if (!this.timelines.has(id)) throw new NotFoundException(`Timeline ${id} not found`);
    this.timelines.delete(id);
  }

  private toDto(r: TimelineRecord): TimelineResponseDto {
    return { id: r.id, name: r.name, description: r.description, createdAt: r.createdAt.toISOString() };
  }
}
