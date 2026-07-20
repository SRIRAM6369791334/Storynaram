import { describe, it, expect } from 'vitest';
import {
  EntityRuntimeError,
  EntityNotFoundError,
  EntityValidationError,
  EntityOperationError,
  PluginError,
  PluginLoadError,
  PluginDependencyError,
  PluginPermissionError,
  PluginConfigurationError,
  AIRuntimeError,
  AIProviderError,
  AIModelError,
  AITimeoutError,
  AIValidationError,
  AIToolError,
  AIRateLimitError,
  AIFallbackExhaustedError,
  QueryError,
  QuerySyntaxError,
  QueryExecutionError,
  QueryOptimizationError,
  QueryTimeoutError,
  WorkflowError,
  WorkflowExecutionError,
  WorkflowStateError,
  WorkflowTimeoutError,
  WorkflowRollbackError,
  WorkflowCheckpointError,
  RepositoryError,
  RepositoryNotFoundError,
  RepositoryConflictError,
  RepositoryTransactionError,
  RepositoryConfigurationError,
  RelationshipError,
  RelationshipNotFoundError,
  RelationshipConflictError,
  GraphCycleError,
  RelationshipValidationError,
  RelationshipConfigurationError,
  RuntimeConfig,
} from '../src';

describe('Error Hierarchy Integration', () => {
  it('all error types should extend EntityRuntimeError', () => {
    const errors = [
      new EntityRuntimeError('test'),
      new EntityNotFoundError('type', 'id'),
      new EntityValidationError('type', ['err']),
      new EntityOperationError('type', 'op', 'reason'),
      new QueryError('test'),
      new QuerySyntaxError('bad syntax'),
      new QueryExecutionError('type', 'reason'),
      new QueryOptimizationError('bad plan'),
      new QueryTimeoutError('type', 5000),
      new WorkflowError('test'),
      new WorkflowExecutionError('wf1', 's1', 'fail'),
      new WorkflowStateError('wf1', 'a', 'b'),
      new WorkflowTimeoutError('wf1', 's1', 5000),
      new WorkflowRollbackError('wf1', 's1', 'fail'),
      new WorkflowCheckpointError('wf1', 'fail'),
      new RepositoryError('test'),
      new RepositoryNotFoundError('type', 'id'),
      new RepositoryConflictError('type', 'id'),
      new RepositoryTransactionError('type', 'txn', 'fail'),
      new RepositoryConfigurationError('bad config'),
      new RelationshipError('test'),
      new RelationshipNotFoundError('edge1'),
      new RelationshipConflictError('a', 'b'),
      new GraphCycleError('a', 'b'),
      new RelationshipValidationError('e1', 'bad'),
      new RelationshipConfigurationError('bad config'),
      new AIRuntimeError('test'),
      new AIProviderError('fail', 'openai'),
      new AIModelError('fail', 'openai', 'gpt-4'),
      new AITimeoutError('timeout', 'openai', 'gpt-4', 5000),
      new AIValidationError('bad', ['issue']),
      new AIToolError('fail', 'tool1'),
      new AIRateLimitError('rate', 'openai', 1000),
      new AIFallbackExhaustedError(['openai'], ['gpt-4']),
      new PluginError('test'),
      new PluginLoadError('fail', 'plugin-a'),
      new PluginDependencyError('fail', 'plugin-a', 'dep-b'),
      new PluginPermissionError('denied', 'plugin-a', 'workflow', 'read'),
      new PluginConfigurationError('bad', 'plugin-a', ['key missing']),
    ];

    for (const error of errors) {
      expect(error instanceof Error).toBe(true);
      expect(error instanceof EntityRuntimeError).toBe(true);
      expect(error.name).toBeDefined();
      expect(error.message).toBeTruthy();
      expect(typeof error.stack).toBe('string');
    }
  });

  it('EntityRuntimeError should support optional code', () => {
    const withCode = new EntityRuntimeError('test', 'MY_CODE');
    expect(withCode.code).toBe('MY_CODE');

    const withoutCode = new EntityRuntimeError('test');
    expect(withoutCode.code).toBeUndefined();
  });

  it('domain-specific errors should have codes', () => {
    expect(new QuerySyntaxError('bad').code).toBe('QUERY_SYNTAX_ERROR');
    expect(new QueryTimeoutError('type', 5000).code).toBe('QUERY_TIMEOUT');
    expect(new WorkflowExecutionError('wf', 's', 'fail').code).toBe('WORKFLOW_EXECUTION_ERROR');
    expect(new WorkflowTimeoutError('wf', 's', 5000).code).toBe('WORKFLOW_TIMEOUT');
    expect(new PluginLoadError('fail', 'a').code).toBe('PLUGIN_LOAD_ERROR');
    expect(new PluginPermissionError('denied', 'a', 'r', 'w').code).toBe('PLUGIN_PERMISSION_ERROR');
    expect(new AIProviderError('fail', 'openai').code).toBe('PROVIDER_ERROR');
    expect(new AIRateLimitError('rate', 'openai').code).toBe('RATE_LIMIT');
    expect(new AIFallbackExhaustedError(['o'], ['m']).code).toBe('FALLBACK_EXHAUSTED');
  });
});

describe('RuntimeConfig Defaults', () => {
  it('should apply defaults when no options provided', () => {
    const config = new RuntimeConfig();
    expect(config.enableCaching).toBe(true);
    expect(config.cacheMaxSize).toBe(500);
    expect(config.enableValidation).toBe(true);
    expect(config.enableEvents).toBe(true);
    expect(config.enableSoftDelete).toBe(true);
    expect(config.entityCacheTtlMs).toBe(300000);
  });

  it('should override individual defaults', () => {
    const config = new RuntimeConfig({ enableCaching: false, cacheMaxSize: 100 });
    expect(config.enableCaching).toBe(false);
    expect(config.cacheMaxSize).toBe(100);
    expect(config.enableValidation).toBe(true); // unchanged
  });
});

describe('Barrel Export Integrity', () => {
  it('should export all expected module classes and functions', () => {
    expect(RuntimeConfig).toBeDefined();
    expect(EntityRuntimeError).toBeDefined();
    expect(EntityNotFoundError).toBeDefined();
    expect(PluginError).toBeDefined();
    expect(AIRuntimeError).toBeDefined();
    expect(QueryError).toBeDefined();
    expect(WorkflowError).toBeDefined();
    expect(RepositoryError).toBeDefined();
    expect(RelationshipError).toBeDefined();
  });
});
