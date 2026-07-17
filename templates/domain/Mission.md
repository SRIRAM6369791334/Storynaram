# Mission Template

**File:** `Mission.template.json`

**Purpose:** Defines a specific task, operation, or objective within a larger quest.

**Inheritance:** BaseEntity → Mission

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseLifecycle, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, questId

**Optional Components:** type, assignedBy, assignedTo, location, objectives, successCriteria, failConditions, consequences, rewards, difficulty, timeLimit

**Relationships:** 1:1 Quest (composition), M:M Character, M:M Location

**Validation Rules:** prefix must be `msn`, questId must reference a valid Quest entity, type must be one of defined enum

**Future Extensions:** Mission success/failure outcome branching, time limit tracking and deadline alerts
