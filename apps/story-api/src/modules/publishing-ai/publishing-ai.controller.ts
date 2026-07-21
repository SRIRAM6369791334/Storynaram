import { Controller, Post, Get, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PublishingAiService } from './publishing-ai.service';
import { AiPublishDto } from './dto/ai-publish.dto';

@ApiTags('AI Publishing')
@ApiBearerAuth()
@Controller('stories/:storyId/publish')
export class PublishingAiController {
  constructor(private readonly publishingAiService: PublishingAiService) {}

  @Post()
  @ApiOperation({ summary: 'Publish story using AI pipeline' })
  async publish(@Param('storyId', ParseUUIDPipe) storyId: string, @Body() dto: AiPublishDto) {
    return this.publishingAiService.publish({ ...dto, storyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get publishing status' })
  async getStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.publishingAiService.getStatus(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download published content' })
  async download(@Param('id', ParseUUIDPipe) _id: string) {
    return { message: 'Download endpoint ready' };
  }
}
