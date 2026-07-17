export type WorkflowStep = {
  id: string;
  name: string;
  handler: string;
  config?: Record<string, unknown>;
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  steps: WorkflowStep[];
  metadata?: Record<string, unknown>;
};
