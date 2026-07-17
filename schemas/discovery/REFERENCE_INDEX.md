# Cross-Schema $ref Index

## BaseEntity ← Domain (35 allOf refs)
All 35 domain entity schemas reference BaseEntity via `allOf`:
- Ability, Armor, Artifact, Book, Canon, Chapter, Character, City, Country, Culture, Dialogue, Document, Family, Item, Kingdom, Language, Location, Magic, Map, Memory, Mission, Organization, Quest, Race, Religion, Rule, Scene, Species, Spell, Technology, Timeline, TimelineEvent, Vehicle, Weapon, World

## BaseEntity ← Core (3 allOf refs)
BaseEntity references three core schemas via `allOf`:
- BaseIdentifier: schemas/core/BaseIdentifier.schema.json
- BaseMetadata: schemas/core/BaseMetadata.schema.json
- BaseAudit: schemas/core/BaseAudit.schema.json

## Workflow ← Workflow* (19 $refs)
Workflow.schema.json references 19 workflow sub-schemas:
- WorkflowState, WorkflowTransition, WorkflowTrigger, WorkflowCondition, WorkflowAction, WorkflowApproval, WorkflowReview, WorkflowAssignment, WorkflowNotification, WorkflowEvent, WorkflowQueue, WorkflowSchedule, WorkflowTimer, WorkflowCheckpoint, WorkflowRollback, WorkflowRetry, WorkflowAudit, WorkflowMetrics, WorkflowConfiguration

## BaseAI ← AI Schemas (conceptual cross-reference)
All 20 AI schemas conceptually extend BaseAI:
- Context Assembly: AIContext, AIMemory, AISession, AIConversation
- Retrieval: AIRetrieval, AISearch, AIEmbedding, AIRanking, AIReference
- Reasoning: AIReasoning, AIValidation, AICanon
- Generation: AIPrompt, AISummary
- Orchestration: AIWorkflow, AIPlanner, AITask
- Configuration: AIConfiguration
- Observability: AIAnalytics, AITokenBudget

## BaseValidation ← Validation Schemas (conceptual cross-reference)
All 20 validation schemas conceptually extend BaseValidation:
- Core: ValidationRule, ValidationProfile, ValidationResult, ValidationError, ValidationWarning, ValidationConstraint, BusinessRule
- Integrity: ReferenceIntegrity, RelationshipIntegrity, CanonIntegrity
- Domain: WorkflowValidation, AIValidationProfile, SecurityValidation, PermissionValidation
- Lifecycle: VersionValidation, MigrationValidation, CompatibilityValidation
- Extension: ExtensionValidation, PluginValidation, IntegrationProfile
