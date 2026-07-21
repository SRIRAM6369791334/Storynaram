import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateCompositionDto } from './dto/create-composition.dto';
import type { CompositionResponseDto } from './dto/composition-response.dto';

interface CompositionRecord {
  id: string;
  title: string;
  description?: string;
  storyId?: string;
  createdAt: Date;
}

@Injectable()
export class CompositionService {
  private readonly compositions = new Map<string, CompositionRecord>();

  async create(dto: CreateCompositionDto): Promise<CompositionResponseDto> {
    const record: CompositionRecord = { id: randomUUID(), title: dto.title, description: dto.description, storyId: dto.storyId, createdAt: new Date() };
    this.compositions.set(record.id, record);
    return this.toDto(record);
  }

  async findAll(): Promise<CompositionResponseDto[]> {
    return Array.from(this.compositions.values()).map(c => this.toDto(c));
  }

  async findByStoryId(storyId: string): Promise<CompositionResponseDto[]> {
    return Array.from(this.compositions.values())
      .filter(c => c.storyId === storyId)
      .map(c => this.toDto(c));
  }

  async findById(id: string): Promise<CompositionResponseDto> {
    const record = this.compositions.get(id);
    if (!record) throw new NotFoundException(`Composition ${id} not found`);
    return this.toDto(record);
  }

  async delete(id: string): Promise<void> {
    if (!this.compositions.has(id)) throw new NotFoundException(`Composition ${id} not found`);
    this.compositions.delete(id);
  }

  private toDto(r: CompositionRecord): CompositionResponseDto {
    return { id: r.id, title: r.title, description: r.description, createdAt: r.createdAt.toISOString() };
  }
}
