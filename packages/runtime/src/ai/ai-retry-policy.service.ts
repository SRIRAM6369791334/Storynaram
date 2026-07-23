import { Injectable, Logger } from '@nestjs/common';
import type { AIRetryConfig, AIRequest, AIResponse } from './types.js';
import { AIRateLimitError, AITimeoutError, AIProviderError } from './errors.js';

export interface RetryHandlerOptions {
  request: AIRequest;
  execute: (request: AIRequest) => Promise<AIResponse>;
  config: AIRetryConfig;
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

@Injectable()
export class AIRetryPolicy {
  private readonly logger = new Logger(AIRetryPolicy.name);

  async executeWithRetry(options: RetryHandlerOptions): Promise<AIResponse> {
    const { request, execute, config, onRetry } = options;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await execute(request);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt >= config.maxRetries) break;

        if (!this.isRetryable(lastError, config)) break;

        const delay = this.calculateDelay(config, attempt);
        this.logger.warn(
          `Retry attempt ${attempt + 1}/${config.maxRetries} for provider "${request.provider}" model "${request.model}": ${lastError.message}`,
        );
        onRetry?.(attempt + 1, lastError, delay);
        await this.sleep(delay);
      }
    }

    throw lastError ?? new Error('Retry failed');
  }

  async executeWithRetryAndFallback(
    request: AIRequest,
    primaryExecute: (req: AIRequest) => Promise<AIResponse>,
    fallbackExecute: (req: AIRequest) => Promise<AIResponse>,
    config: AIRetryConfig,
  ): Promise<AIResponse> {
    try {
      return await this.executeWithRetry({
        request,
        execute: primaryExecute,
        config,
      });
    } catch (error) {
      this.logger.warn(`Primary execution failed, attempting fallback: ${error instanceof Error ? error.message : String(error)}`);
      return fallbackExecute(request);
    }
  }

  private isRetryable(error: Error, config: AIRetryConfig): boolean {
    if (config.retryableErrors && config.retryableErrors.length > 0) {
      return config.retryableErrors.some(type => {
        if (type === 'rate_limit') return error instanceof AIRateLimitError;
        if (type === 'timeout') return error instanceof AITimeoutError;
        if (type === 'provider') return error instanceof AIProviderError;
        return error.message.includes(type);
      });
    }
    return (
      error instanceof AIRateLimitError ||
      error instanceof AITimeoutError ||
      error instanceof AIProviderError
    );
  }

  private calculateDelay(config: AIRetryConfig, attempt: number): number {
    const delay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt);
    return Math.min(delay, config.maxDelayMs);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
