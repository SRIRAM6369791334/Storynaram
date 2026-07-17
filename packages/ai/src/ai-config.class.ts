import { AiModelType } from './ai-model-type.enum';

export class AiConfig {
  constructor(
    public readonly modelType: AiModelType,
    public readonly temperature: number = 0.7,
    public readonly maxTokens: number = 2048,
    public readonly apiKey?: string,
  ) {}
}
