import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NarrativeService } from './narrative.service.js';
import { CreateNarrativeDto } from './dto/create-narrative.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Narratives')
@ApiBearerAuth()
@Controller('narratives')
export class NarrativeController {
  constructor(private readonly narrativeService: NarrativeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a narrative' })
  async create(@Body() dto: CreateNarrativeDto) {
    return this.narrativeService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all narratives' })
  async findAll() {
    return this.narrativeService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a narrative by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.narrativeService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a narrative' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.narrativeService.delete(id);
  }
}
