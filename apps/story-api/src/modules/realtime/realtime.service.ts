import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimeService {
  constructor(private readonly gateway: RealtimeGateway) {}

  notifyGenerationProgress(storyId: string, progress: number, message: string): void {
    this.gateway.emitToChannel(`story:${storyId}`, 'generation:progress', { storyId, progress, message });
  }

  notifyPublishingProgress(storyId: string, progress: number, message: string): void {
    this.gateway.emitToChannel(`story:${storyId}`, 'publishing:progress', { storyId, progress, message });
  }

  notifyRevisionProgress(storyId: string, progress: number, message: string): void {
    this.gateway.emitToChannel(`story:${storyId}`, 'revision:progress', { storyId, progress, message });
  }

  notifyStoryUpdate(storyId: string, event: string, data: unknown): void {
    this.gateway.emitToChannel(`story:${storyId}`, event, data);
  }

  sendNotification(clientId: string, title: string, body: string): void {
    this.gateway.sendProgress(clientId, 'notification', { progress: 100, message: `${title}: ${body}` });
  }
}
