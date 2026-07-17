import { Module } from '@nestjs/common';
import { ConfigModule } from '@storynaram/config';
import { LoggerModule } from '@storynaram/logger';
import { EventBusModule } from '@storynaram/events';
import { WorkerService } from './worker/worker.service.js';
import { HealthService } from './health/health.service.js';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRoot(),
    EventBusModule.forRoot(),
  ],
  providers: [WorkerService, HealthService],
})
export class WorkerModule {}
