import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateWorldDto } from './dto/create-world.dto';
import type { WorldResponseDto } from './dto/world-response.dto';

interface WorldRecord {
  id: string;
  name: string;
  description?: string;
  genre?: string;
  storyId?: string;
  createdAt: Date;
}

@Injectable()
export class WorldService {
  private readonly worlds = new Map<string, WorldRecord>();

  async create(dto: CreateWorldDto): Promise<WorldResponseDto> {
    const record: WorldRecord = { id: randomUUID(), name: dto.name, description: dto.description, genre: dto.genre, storyId: dto.storyId, createdAt: new Date() };
    this.worlds.set(record.id, record);
    return this.toDto(record);
  }

  async findAll(): Promise<WorldResponseDto[]> {
    return Array.from(this.worlds.values()).map(w => this.toDto(w));
  }

  async findByStoryId(storyId: string): Promise<WorldResponseDto[]> {
    return Array.from(this.worlds.values())
      .filter(w => w.storyId === storyId)
      .map(w => this.toDto(w));
  }

  async findById(id: string): Promise<WorldResponseDto> {
    const record = this.worlds.get(id);
    if (!record) throw new NotFoundException(`World ${id} not found`);
    return this.toDto(record);
  }

  async delete(id: string): Promise<void> {
    if (!this.worlds.has(id)) throw new NotFoundException(`World ${id} not found`);
    this.worlds.delete(id);
  }

  private toDto(r: WorldRecord): WorldResponseDto {
    return { id: r.id, name: r.name, description: r.description, genre: r.genre, createdAt: r.createdAt.toISOString() };
  }
}
