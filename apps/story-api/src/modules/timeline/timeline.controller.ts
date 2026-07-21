import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';
import { CreateTimelineDto } from './dto/create-timeline.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Timelines')
@ApiBearerAuth()
@Controller('timelines')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Post()
  @ApiOperation({ summary: 'Create a timeline' })
  async create(@Body() dto: CreateTimelineDto) {
    return this.timelineService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all timelines' })
  async findAll() {
    return this.timelineService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a timeline by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.timelineService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a timeline' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.timelineService.delete(id);
  }
}
