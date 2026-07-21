import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompositionService } from './composition.service';
import { CreateCompositionDto } from './dto/create-composition.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Compositions')
@ApiBearerAuth()
@Controller('compositions')
export class CompositionController {
  constructor(private readonly compositionService: CompositionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a composition' })
  async create(@Body() dto: CreateCompositionDto) {
    return this.compositionService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all compositions' })
  async findAll() {
    return this.compositionService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a composition by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.compositionService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a composition' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.compositionService.delete(id);
  }
}
