import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreatePublishingDto } from './dto/create-publishing.dto';
import type { PublishingResponseDto } from './dto/publishing-response.dto';

interface PublishingRecord {
  id: string;
  storyId: string;
  status: string;
  formats: string[];
  profile?: string;
  createdAt: Date;
}

@Injectable()
export class PublishingService {
  private readonly publications = new Map<string, PublishingRecord>();

  async create(dto: CreatePublishingDto): Promise<PublishingResponseDto> {
    const record: PublishingRecord = {
      id: randomUUID(),
      storyId: dto.storyId,
      status: 'pending',
      formats: dto.formats ?? ['html'],
      profile: dto.profile,
      createdAt: new Date(),
    };
    this.publications.set(record.id, record);
    return this.toDto(record);
  }

  async findAll(): Promise<PublishingResponseDto[]> {
    return Array.from(this.publications.values()).map(p => this.toDto(p));
  }

  async findById(id: string): Promise<PublishingResponseDto> {
    const record = this.publications.get(id);
    if (!record) throw new NotFoundException(`Publication ${id} not found`);
    return this.toDto(record);
  }

  async getStatus(id: string): Promise<PublishingResponseDto> {
    return this.findById(id);
  }

  private toDto(r: PublishingRecord): PublishingResponseDto {
    return { id: r.id, storyId: r.storyId, status: r.status, formats: r.formats, createdAt: r.createdAt.toISOString() };
  }
}
