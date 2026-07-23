import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PublishingService } from './publishing.service.js';
import { CreatePublishingDto } from './dto/create-publishing.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Publishing')
@ApiBearerAuth()
@Controller('stories/:storyId/publishing')
export class PublishingController {
  constructor(private readonly publishingService: PublishingService) {}

  @Post()
  @ApiOperation({ summary: 'Publish a story' })
  async create(@Param('storyId', ParseUUIDPipe) storyId: string, @Body() dto: CreatePublishingDto) {
    return this.publishingService.create({ ...dto, storyId });
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List publications for a story' })
  async findAll() {
    return this.publishingService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get publication status' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.publishingService.findById(id);
  }
}
