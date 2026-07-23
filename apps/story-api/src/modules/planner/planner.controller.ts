import { Controller, Post, Get, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlannerService } from './planner.service.js';
import { PlanStoryDto } from './dto/plan-story.dto.js';

@ApiTags('AI Planning')
@ApiBearerAuth()
@Controller('stories/:storyId/plan')
export class PlannerController {
  constructor(private readonly plannerService: PlannerService) {}

  @Post()
  @ApiOperation({ summary: 'Plan a story using AI' })
  async plan(@Param('storyId', ParseUUIDPipe) storyId: string, @Body() dto: PlanStoryDto) {
    return this.plannerService.plan({ ...dto, storyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get planning status' })
  async getStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.plannerService.getStatus(id);
  }
}
