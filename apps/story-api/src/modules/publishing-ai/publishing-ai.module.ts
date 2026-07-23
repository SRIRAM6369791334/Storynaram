import { Module } from '@nestjs/common';
import { PublishingAiController } from './publishing-ai.controller.js';
import { PublishingAiService } from './publishing-ai.service.js';

@Module({
  controllers: [PublishingAiController],
  providers: [PublishingAiService],
  exports: [PublishingAiService],
})
export class PublishingAiModule {}
