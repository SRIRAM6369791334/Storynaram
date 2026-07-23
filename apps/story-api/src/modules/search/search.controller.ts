import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Global search' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async search(
    @Query('q') q: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.searchService.search(q ?? '', type, Number(page) || 1, Number(limit) || 20);
  }

  @Get('stories')
  @Public()
  @ApiOperation({ summary: 'Search stories' })
  async searchStories(@Query('q') q: string) {
    return this.searchService.searchStories(q ?? '');
  }

  @Get('characters')
  @Public()
  @ApiOperation({ summary: 'Search characters' })
  async searchCharacters(@Query('q') q: string) {
    return this.searchService.searchCharacters(q ?? '');
  }

  @Get('worlds')
  @Public()
  @ApiOperation({ summary: 'Search worlds' })
  async searchWorlds(@Query('q') q: string) {
    return this.searchService.searchWorlds(q ?? '');
  }

  @Get('timelines')
  @Public()
  @ApiOperation({ summary: 'Search timelines' })
  async searchTimelines(@Query('q') q: string) {
    return this.searchService.searchTimelines(q ?? '');
  }

  @Get('canon')
  @Public()
  @ApiOperation({ summary: 'Search canon entries' })
  async searchCanon(@Query('q') q: string) {
    return this.searchService.searchCanon(q ?? '');
  }
}
