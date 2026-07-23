import { Controller, Post, Get, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RevisionService } from './revision.service.js';
import { ReviseStoryDto } from './dto/revise-story.dto.js';

@ApiTags('AI Revision')
@ApiBearerAuth()
@Controller('stories/:storyId/revise')
export class RevisionController {
  constructor(private readonly revisionService: RevisionService) {}

  @Post()
  @ApiOperation({ summary: 'Revise story using AI' })
  async revise(@Param('storyId', ParseUUIDPipe) storyId: string, @Body() dto: ReviseStoryDto) {
    return this.revisionService.revise({ ...dto, storyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get revision status' })
  async getStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.revisionService.getStatus(id);
  }
}
