import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@ApiTags('Monitoring')
@ApiBearerAuth()
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('stats')
  @Roles('admin')
  @ApiOperation({ summary: 'Get monitoring statistics' })
  async getStats() {
    return this.monitoringService.getStats();
  }

  @Get('health')
  @ApiOperation({ summary: 'Detailed health check' })
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      ...this.monitoringService.getStats(),
    };
  }
}
