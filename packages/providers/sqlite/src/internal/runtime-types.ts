export type RelationshipType =
  | 'oneToOne' | 'oneToMany' | 'manyToMany'
  | 'directed' | 'bidirectional' | 'hierarchical'
  | 'reference' | 'dependency' | 'ownership';

export interface RelationshipEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  label?: string;
  weight?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRelationshipInput {
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  label?: string;
  weight?: number;
  metadata?: Record<string, unknown>;
}

export interface AIMessage {
  role: string;
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: Array<Record<string, unknown>>;
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
  systemPrompt?: string;
  maxMessages?: number;
  metadata: Record<string, unknown>;
}

export interface AISession {
  id: string;
  conversation: AIConversation;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

export type PluginId = string;

export type WorkflowEventType =
  | 'WorkflowStarted' | 'WorkflowPaused' | 'WorkflowResumed'
  | 'WorkflowCancelled' | 'WorkflowCompleted' | 'WorkflowFailed'
  | 'WorkflowRetried' | 'WorkflowStepStarted'
  | 'WorkflowStepCompleted' | 'WorkflowStepFailed';

export interface HistoryEntry {
  id: string;
  workflowId: string;
  stepId: string | null;
  eventType: WorkflowEventType;
  status: string;
  data: Record<string, unknown>;
  timestamp: Date;
  durationMs: number | null;
}
