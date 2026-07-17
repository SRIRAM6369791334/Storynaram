import { Module } from '@nestjs/common';
import { ConfigModule } from '@storynaram/config';
import { LoggerModule } from '@storynaram/logger';
import { HealthModule } from './health/health.module';
import { AppController } from './app.controller';

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
