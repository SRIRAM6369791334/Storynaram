import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateCharacterDto } from './dto/create-character.dto';
import type { CharacterResponseDto } from './dto/character-response.dto';

interface CharacterRecord {
  id: string;
  name: string;
  role?: string;
  species?: string;
  storyId?: string;
  createdAt: Date;
}

@Injectable()
export class CharacterService {
  private readonly characters = new Map<string, CharacterRecord>();

  async create(dto: CreateCharacterDto): Promise<CharacterResponseDto> {
    const record: CharacterRecord = {
      id: randomUUID(),
      name: dto.name,
      role: dto.role,
      species: dto.species,
      storyId: dto.storyId,
      createdAt: new Date(),
    };
    this.characters.set(record.id, record);
    return this.toDto(record);
  }

  async findAll(storyId?: string): Promise<CharacterResponseDto[]> {
    const all = Array.from(this.characters.values());
    const filtered = storyId ? all.filter(c => c.storyId === storyId) : all;
    return filtered.map(c => this.toDto(c));
  }

  async findById(id: string): Promise<CharacterResponseDto> {
    const record = this.characters.get(id);
    if (!record) throw new NotFoundException(`Character ${id} not found`);
    return this.toDto(record);
  }

  async delete(id: string): Promise<void> {
    if (!this.characters.has(id)) throw new NotFoundException(`Character ${id} not found`);
    this.characters.delete(id);
  }

  private toDto(r: CharacterRecord): CharacterResponseDto {
    return { id: r.id, name: r.name, role: r.role, species: r.species, createdAt: r.createdAt.toISOString() };
  }
}
