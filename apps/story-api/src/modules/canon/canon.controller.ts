import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CanonService } from './canon.service.js';
import { CreateCanonDto } from './dto/create-canon.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Canon')
@ApiBearerAuth()
@Controller('canon')
export class CanonController {
  constructor(private readonly canonService: CanonService) {}

  @Post()
  @ApiOperation({ summary: 'Create a canon entry' })
  async create(@Body() dto: CreateCanonDto) {
    return this.canonService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all canon entries' })
  async findAll() {
    return this.canonService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a canon entry by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.canonService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a canon entry' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.canonService.delete(id);
  }
}
