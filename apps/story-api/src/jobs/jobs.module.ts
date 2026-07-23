import { Module, forwardRef, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service.js';
import { GenerationProducer } from './producers/generation.producer.js';
import { RevisionProducer } from './producers/revision.producer.js';
import { PublishingProducer } from './producers/publishing.producer.js';
import { BulkExportProducer } from './producers/bulk-export.producer.js';
import { GenerationConsumer } from './consumers/generation.consumer.js';
import { RevisionConsumer } from './consumers/revision.consumer.js';
import { PublishingConsumer } from './consumers/publishing.consumer.js';
import { BulkExportConsumer } from './consumers/bulk-export.consumer.js';
import { GenerationModule } from '../modules/generation/generation.module.js';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue(
      { name: 'story-generation' },
      { name: 'story-revision' },
      { name: 'story-publishing' },
      { name: 'bulk-export' },
    ),
    forwardRef(() => GenerationModule),
  ],
  providers: [
    JobsService,
    GenerationProducer, RevisionProducer,
    PublishingProducer, BulkExportProducer,
    GenerationConsumer, RevisionConsumer,
    PublishingConsumer, BulkExportConsumer,
  ],
  exports: [
    JobsService,
    GenerationProducer, RevisionProducer,
    PublishingProducer, BulkExportProducer,
    BullModule,
  ],
})
export class JobsModule {}
