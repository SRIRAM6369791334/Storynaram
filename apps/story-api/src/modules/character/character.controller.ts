import { Controller, Get, Post, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CharacterService } from './character.service.js';
import { CreateCharacterDto } from './dto/create-character.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Characters')
@ApiBearerAuth()
@Controller('characters')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a character' })
  async create(@Body() dto: CreateCharacterDto) {
    return this.characterService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List characters' })
  @ApiQuery({ name: 'storyId', required: false })
  async findAll(@Query('storyId') storyId?: string) {
    return this.characterService.findAll(storyId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a character by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.characterService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a character' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.characterService.delete(id);
  }
}
