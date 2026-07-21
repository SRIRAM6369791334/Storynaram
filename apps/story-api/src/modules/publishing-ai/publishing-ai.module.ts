import { Module } from '@nestjs/common';
import { PublishingAiController } from './publishing-ai.controller';
import { PublishingAiService } from './publishing-ai.service';

@Module({
  controllers: [PublishingAiController],
  providers: [PublishingAiService],
  exports: [PublishingAiService],
})
export class PublishingAiModule {}
