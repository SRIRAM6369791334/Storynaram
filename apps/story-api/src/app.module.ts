import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@storynaram/config';
import { LoggerModule } from '@storynaram/logger';
import { EventBusModule } from '@storynaram/events';
import { TelemetryModule } from '@storynaram/telemetry';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { StoryModule } from './modules/story/story.module';
import { CharacterModule } from './modules/character/character.module';
import { WorldModule } from './modules/world/world.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { CanonModule } from './modules/canon/canon.module';
import { NarrativeModule } from './modules/narrative/narrative.module';
import { CompositionModule } from './modules/composition/composition.module';
import { PublishingModule } from './modules/publishing/publishing.module';
import { PlannerModule } from './modules/planner/planner.module';
import { GenerationModule } from './modules/generation/generation.module';
import { RevisionModule } from './modules/revision/revision.module';
import { PublishingAiModule } from './modules/publishing-ai/publishing-ai.module';
import { SearchModule } from './modules/search/search.module';
import { StorageModule } from './modules/storage/storage.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { JobsModule } from './jobs/jobs.module';
import { ApiModule } from './modules/api/api.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({ throttlers: [{ limit: 100, ttl: 60000 }] }),
    ConfigModule.forRoot(),
    LoggerModule.forRoot(),
    EventBusModule.forRoot(),
    TelemetryModule.forRoot(),
    AuthModule,
    HealthModule,
    MonitoringModule,
    StoryModule,
    CharacterModule,
    WorldModule,
    TimelineModule,
    CanonModule,
    NarrativeModule,
    CompositionModule,
    PublishingModule,
    PlannerModule,
    GenerationModule,
    RevisionModule,
    PublishingAiModule,
    SearchModule,
    StorageModule,
    RealtimeModule,
    JobsModule,
    ApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
