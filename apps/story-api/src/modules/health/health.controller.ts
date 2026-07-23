import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check() {
    return this.healthService.check();
  }
}
