export type AIProviderName = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'openrouter' | 'azure' | 'custom' | 'mock';

export type AIMessageRole = 'system' | 'developer' | 'user' | 'assistant' | 'tool';

export type AIFinishReason = 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'error' | 'cancelled';

export interface AIMessage {
  role: AIMessageRole;
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: AIToolCall[];
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AIRequest {
  model: string;
  provider?: AIProviderName;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stop?: string[];
  tools?: AIToolDefinition[];
  toolChoice?: 'auto' | 'required' | 'none' | { type: 'function'; function: { name: string } };
  stream?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AIResponse {
  id: string;
  model: string;
  provider: AIProviderName;
  messages: AIMessage[];
  tokenUsage: AITokenUsage;
  finishReason: AIFinishReason;
  latencyMs: number;
  metadata?: Record<string, unknown>;
}

export interface AIStreamChunk {
  index: number;
  delta: string;
  finishReason: AIFinishReason | null;
  tokenUsage?: AITokenUsage;
  toolCalls?: AIToolCall[];
}

export interface AITokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd?: number;
}

export interface AIModelMetadata {
  id: string;
  provider: AIProviderName;
  displayName: string;
  contextWindow: number;
  maxOutputTokens: number;
  capabilities: AIModelCapabilities;
  pricing?: AIModelPricing;
  metadata?: Record<string, unknown>;
}

export interface AIModelCapabilities {
  vision: boolean;
  toolUse: boolean;
  streaming: boolean;
  functionCalling: boolean;
  jsonMode: boolean;
  embedding: boolean;
}

export interface AIModelPricing {
  inputPer1K: number;
  outputPer1K: number;
  currency: string;
}

export interface AIProviderCapabilities {
  streaming: boolean;
  toolUse: boolean;
  vision: boolean;
  functionCalling: boolean;
  embedding: boolean;
  jsonMode: boolean;
  maxConcurrent: number;
}

export interface AIProviderHealth {
  ok: boolean;
  latencyMs: number;
  lastChecked: Date;
  error?: string;
}

export interface AISession {
  id: string;
  conversation: AIConversation;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
  maxMessages?: number;
  systemPrompt?: string;
  metadata: Record<string, unknown>;
}

export interface AIContext {
  values: Map<string, unknown>;
  variables: Record<string, string>;
  metadata: Record<string, unknown>;
}

export interface AIToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface AITool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute(args: Record<string, unknown>, context?: Record<string, unknown>): Promise<AIToolResult>;
}

export interface AIToolResult {
  success: boolean;
  output: unknown;
  error?: string;
  durationMs: number;
  toolName: string;
}

export interface AIPromptTemplate {
  id: string;
  version: string;
  name: string;
  description?: string;
  template: string;
  variables: string[];
  systemPrompt?: string;
  metadata?: Record<string, unknown>;
}

export interface AIPromptOptions {
  template?: string | AIPromptTemplate;
  variables?: Record<string, string>;
  systemPrompt?: string;
  developerPrompt?: string;
  messages?: AIMessage[];
  metadata?: Record<string, unknown>;
}

export interface AIOutputValidationOptions {
  schemaId?: string;
  schema?: Record<string, unknown>;
  maxRetries?: number;
}

export interface AIRetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export interface AIFallbackConfig {
  providers: AIProviderName[];
  models: string[];
  timeoutMs?: number;
}

export interface AIProviderConfig {
  name: AIProviderName;
  displayName: string;
  apiKey?: string;
  baseUrl?: string;
  organization?: string;
  defaultModel?: string;
  capabilities?: Partial<AIProviderCapabilities>;
  metadata?: Record<string, unknown>;
}

export interface AIRuntimeOptions {
  defaultProvider?: AIProviderName;
  defaultModel?: string;
  enableCache?: boolean;
  enableStatistics?: boolean;
  enableCostTracking?: boolean;
  defaultRetry?: AIRetryConfig;
  defaultFallback?: AIFallbackConfig;
  providers?: AIProviderConfig[];
  cacheTtlMs?: number;
}

export interface AIGenerateOptions {
  provider?: AIProviderName;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  retry?: AIRetryConfig;
  fallback?: AIFallbackConfig;
  outputValidation?: AIOutputValidationOptions;
  tools?: AITool[];
  cache?: boolean;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface AIRequestStartedEvent {
  requestId: string;
  provider: AIProviderName;
  model: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AIRequestCompletedEvent {
  requestId: string;
  provider: AIProviderName;
  model: string;
  timestamp: Date;
  tokenUsage: AITokenUsage;
  latencyMs: number;
  metadata?: Record<string, unknown>;
}

export interface AIRequestFailedEvent {
  requestId: string;
  provider: AIProviderName;
  model: string;
  error: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AIToolExecutedEvent {
  toolName: string;
  success: boolean;
  durationMs: number;
  timestamp: Date;
  error?: string;
}

export interface AIProviderFallbackEvent {
  fromProvider: AIProviderName;
  toProvider: AIProviderName;
  fromModel: string;
  toModel: string;
  reason: string;
  timestamp: Date;
}

export interface AIStatistics {
  totalRequests: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
  successCount: number;
  failureCount: number;
  cacheHitCount: number;
  cacheMissCount: number;
  averageLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  providerStats: Record<string, AIProviderStatistics>;
}

export interface AIProviderStatistics {
  totalRequests: number;
  successCount: number;
  failureCount: number;
  totalTokens: number;
  totalCostUsd: number;
  averageLatencyMs: number;
}
