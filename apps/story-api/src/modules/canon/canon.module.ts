import { Module } from '@nestjs/common';
import { CanonController } from './canon.controller.js';
import { CanonService } from './canon.service.js';

@Module({
  controllers: [CanonController],
  providers: [CanonService],
  exports: [CanonService],
})
export class CanonModule {}
