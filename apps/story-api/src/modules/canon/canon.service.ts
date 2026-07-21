import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateCanonDto } from './dto/create-canon.dto';
import type { CanonResponseDto } from './dto/canon-response.dto';

interface CanonRecord {
  id: string;
  name: string;
  description?: string;
  storyId?: string;
  createdAt: Date;
}

@Injectable()
export class CanonService {
  private readonly canons = new Map<string, CanonRecord>();

  async create(dto: CreateCanonDto): Promise<CanonResponseDto> {
    const record: CanonRecord = { id: randomUUID(), name: dto.name, description: dto.description, storyId: dto.storyId, createdAt: new Date() };
    this.canons.set(record.id, record);
    return this.toDto(record);
  }

  async findAll(): Promise<CanonResponseDto[]> {
    return Array.from(this.canons.values()).map(c => this.toDto(c));
  }

  async findById(id: string): Promise<CanonResponseDto> {
    const record = this.canons.get(id);
    if (!record) throw new NotFoundException(`Canon entry ${id} not found`);
    return this.toDto(record);
  }

  async delete(id: string): Promise<void> {
    if (!this.canons.has(id)) throw new NotFoundException(`Canon entry ${id} not found`);
    this.canons.delete(id);
  }

  private toDto(r: CanonRecord): CanonResponseDto {
    return { id: r.id, name: r.name, description: r.description, createdAt: r.createdAt.toISOString() };
  }
}
