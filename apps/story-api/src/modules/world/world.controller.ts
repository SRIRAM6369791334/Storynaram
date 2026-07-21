import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorldService } from './world.service';
import { CreateWorldDto } from './dto/create-world.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Worlds')
@ApiBearerAuth()
@Controller('worlds')
export class WorldController {
  constructor(private readonly worldService: WorldService) {}

  @Post()
  @ApiOperation({ summary: 'Create a world' })
  async create(@Body() dto: CreateWorldDto) {
    return this.worldService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all worlds' })
  async findAll() {
    return this.worldService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a world by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.worldService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a world' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.worldService.delete(id);
  }
}
