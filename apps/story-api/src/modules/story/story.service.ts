import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import type { StoryResponseDto } from './dto/story-response.dto';

interface StoryRecord {
  id: string;
  title: string;
  description?: string;
  status: string;
  genres: string[];
  authorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class StoryService {
  private readonly stories = new Map<string, StoryRecord>();

  async create(dto: CreateStoryDto): Promise<StoryResponseDto> {
    const now = new Date();
    const story: StoryRecord = {
      id: randomUUID(),
      title: dto.title,
      description: dto.description,
      status: 'draft',
      genres: dto.genres ?? [],
      authorId: dto.authorId,
      createdAt: now,
      updatedAt: now,
    };
    this.stories.set(story.id, story);
    return this.toDto(story);
  }

  async findAll(): Promise<StoryResponseDto[]> {
    return Array.from(this.stories.values()).map(s => this.toDto(s));
  }

  async findById(id: string): Promise<StoryResponseDto> {
    const story = this.stories.get(id);
    if (!story) throw new NotFoundException(`Story ${id} not found`);
    return this.toDto(story);
  }

  async update(id: string, dto: UpdateStoryDto): Promise<StoryResponseDto> {
    const story = this.stories.get(id);
    if (!story) throw new NotFoundException(`Story ${id} not found`);

    if (dto.title !== undefined) story.title = dto.title;
    if (dto.description !== undefined) story.description = dto.description;
    if (dto.genres !== undefined) story.genres = dto.genres;
    story.updatedAt = new Date();

    return this.toDto(story);
  }

  async delete(id: string): Promise<void> {
    if (!this.stories.has(id)) throw new NotFoundException(`Story ${id} not found`);
    this.stories.delete(id);
  }

  private toDto(record: StoryRecord): StoryResponseDto {
    return {
      id: record.id,
      title: record.title,
      description: record.description,
      status: record.status,
      genres: record.genres,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
