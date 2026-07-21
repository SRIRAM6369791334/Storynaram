import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StoryService } from './story.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Stories')
@ApiBearerAuth()
@Controller('stories')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new story' })
  async create(@Body() dto: CreateStoryDto) {
    return this.storyService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all stories' })
  async findAll() {
    return this.storyService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a story by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.storyService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a story' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStoryDto) {
    return this.storyService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a story' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.storyService.delete(id);
  }
}
