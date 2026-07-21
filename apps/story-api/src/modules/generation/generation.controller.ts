import { Controller, Post, Get, Body, Param, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GenerationService } from './generation.service';
import { GenerateStoryDto } from './dto/generate-story.dto';

@ApiTags('AI Generation')
@ApiBearerAuth()
@Controller('stories/:storyId/generate')
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post()
  @ApiOperation({ summary: 'Generate story content using AI (async, returns generation ID)' })
  async generate(@Param('storyId') storyId: string, @Body() dto: GenerateStoryDto) {
    return this.generationService.generate({ ...dto, storyId });
  }

  @Post('stream')
  @ApiOperation({ summary: 'Generate story content using AI with Server-Sent Events streaming' })
  async generateStream(
    @Param('storyId') storyId: string,
    @Body() dto: GenerateStoryDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      await this.generationService.generateStream({ ...dto, storyId }, (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      });
      res.write('event: done\ndata: {}\n\n');
      res.end();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
      res.end();
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get generation status and results' })
  async getStatus(@Param('id') id: string) {
    const result = await this.generationService.getStatus(id);
    if (!result) {
      return { statusCode: HttpStatus.NOT_FOUND, message: 'Generation not found' };
    }
    return result;
  }
}
