import { Controller, Post, Get, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GenerationService } from './generation.service';
import { GenerateStoryDto } from './dto/generate-story.dto';

@ApiTags('AI Generation')
@ApiBearerAuth()
@Controller('stories/:storyId/generate')
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post()
  @ApiOperation({ summary: 'Generate story content using AI' })
  async generate(@Param('storyId', ParseUUIDPipe) storyId: string, @Body() dto: GenerateStoryDto) {
    return this.generationService.generate({ ...dto, storyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get generation status' })
  async getStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.generationService.getStatus(id);
  }
}
