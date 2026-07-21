import { Module } from '@nestjs/common';
import { ConfigModule } from '@storynaram/config';
import { LoggerModule } from '@storynaram/logger';
import { HealthModule } from './health/health.module.js';
import { AppController } from './app.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRoot(),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
