import { Injectable } from '@nestjs/common';
import { AiConfig } from './ai-config.class';
import { AiModelType } from './ai-model-type.enum';

@Injectable()
export abstract class AiProviderPort {
  abstract generateText(prompt: string, config?: AiConfig): Promise<string>;
  abstract generateEmbedding(text: string): Promise<number[]>;
  abstract getAvailableModels(): Promise<AiModelType[]>;
}
