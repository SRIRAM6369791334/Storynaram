import { Injectable, Logger } from '@nestjs/common';
import type { AIRequest, AIResponse } from './types.js';

interface CacheEntry {
  response: AIResponse;
  expiresAt: number;
  hitCount: number;
}

@Injectable()
export class AICacheService {
  private readonly logger = new Logger(AICacheService.name);
  private readonly cache: Map<string, CacheEntry> = new Map();
  private ttlMs: number;
  private hits = 0;
  private misses = 0;

  constructor(ttlMs: number = 300000) {
    this.ttlMs = ttlMs;
  }

  setTtl(ttlMs: number): void {
    this.ttlMs = ttlMs;
  }

  generateKey(request: AIRequest): string {
    const relevant = {
      model: request.model,
      provider: request.provider,
      messages: request.messages.map(m => ({ role: m.role, content: m.content, toolCallId: m.toolCallId })),
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      topP: request.topP,
      tools: request.tools ? request.tools.map(t => t.function.name) : undefined,
    };
    const str = JSON.stringify(relevant);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `${request.provider ?? 'default'}:${request.model}:${Math.abs(hash).toString(36)}`;
  }

  get(key: string): AIResponse | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }
    this.hits++;
    entry.hitCount++;
    return entry.response;
  }

  set(key: string, response: AIResponse): void {
    this.cache.set(key, {
      response,
      expiresAt: Date.now() + this.ttlMs,
      hitCount: 0,
    });
  }

  getOrSet(key: string, factory: () => Promise<AIResponse>): Promise<AIResponse> {
    const cached = this.get(key);
    if (cached) return Promise.resolve(cached);
    return factory().then(response => {
      this.set(key, response);
      return response;
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateByProvider(provider: string): void {
    for (const [key] of this.cache) {
      if (key.startsWith(`${provider}:`)) {
        this.cache.delete(key);
      }
    }
  }

  invalidateByModel(model: string): void {
    for (const [key, entry] of this.cache) {
      if (key.includes(`:${model}:`) || key.endsWith(`:${model}`)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  get size(): number {
    return this.cache.size;
  }

  get stats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 ? this.hits / (this.hits + this.misses) : 0,
      ttlMs: this.ttlMs,
    };
  }

  prune(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        pruned++;
      }
    }
    return pruned;
  }
}
