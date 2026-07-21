import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateNarrativeDto } from './dto/create-narrative.dto';
import type { NarrativeResponseDto } from './dto/narrative-response.dto';

interface NarrativeRecord {
  id: string;
  title: string;
  description?: string;
  storyId?: string;
  createdAt: Date;
}

@Injectable()
export class NarrativeService {
  private readonly narratives = new Map<string, NarrativeRecord>();

  async create(dto: CreateNarrativeDto): Promise<NarrativeResponseDto> {
    const record: NarrativeRecord = { id: randomUUID(), title: dto.title, description: dto.description, storyId: dto.storyId, createdAt: new Date() };
    this.narratives.set(record.id, record);
    return this.toDto(record);
  }

  async findAll(): Promise<NarrativeResponseDto[]> {
    return Array.from(this.narratives.values()).map(n => this.toDto(n));
  }

  async findByStoryId(storyId: string): Promise<NarrativeResponseDto[]> {
    return Array.from(this.narratives.values())
      .filter(n => n.storyId === storyId)
      .map(n => this.toDto(n));
  }

  async findById(id: string): Promise<NarrativeResponseDto> {
    const record = this.narratives.get(id);
    if (!record) throw new NotFoundException(`Narrative ${id} not found`);
    return this.toDto(record);
  }

  async delete(id: string): Promise<void> {
    if (!this.narratives.has(id)) throw new NotFoundException(`Narrative ${id} not found`);
    this.narratives.delete(id);
  }

  private toDto(r: NarrativeRecord): NarrativeResponseDto {
    return { id: r.id, title: r.title, description: r.description, createdAt: r.createdAt.toISOString() };
  }
}
