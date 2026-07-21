import { Module } from '@nestjs/common';
import { CompositionController } from './composition.controller';
import { CompositionService } from './composition.service';

@Module({
  controllers: [CompositionController],
  providers: [CompositionService],
  exports: [CompositionService],
})
export class CompositionModule {}
