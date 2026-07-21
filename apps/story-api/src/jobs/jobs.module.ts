import { Module, forwardRef, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service';
import { GenerationProducer } from './producers/generation.producer';
import { RevisionProducer } from './producers/revision.producer';
import { PublishingProducer } from './producers/publishing.producer';
import { BulkExportProducer } from './producers/bulk-export.producer';
import { GenerationConsumer } from './consumers/generation.consumer';
import { RevisionConsumer } from './consumers/revision.consumer';
import { PublishingConsumer } from './consumers/publishing.consumer';
import { BulkExportConsumer } from './consumers/bulk-export.consumer';
import { GenerationModule } from '../modules/generation/generation.module';

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
