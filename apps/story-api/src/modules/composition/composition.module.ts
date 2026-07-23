import { Module } from '@nestjs/common';
import { CompositionController } from './composition.controller.js';
import { CompositionService } from './composition.service.js';

@Module({
  controllers: [CompositionController],
  providers: [CompositionService],
  exports: [CompositionService],
})
export class CompositionModule {}
