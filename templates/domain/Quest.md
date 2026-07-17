# Quest Template

**File:** `Quest.template.json`

**Purpose:** Defines a quest, journey, or overarching mission with objectives, stages, and rewards.

**Inheritance:** BaseEntity → Quest

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseLifecycle, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, type

**Optional Components:** bookId, giver, objectives, participants, rewards, difficulty, stages, prerequisites, failConditions, relatedQuests

**Relationships:** M:M Character, M:M Location, M:M TimelineEvent, M:M Item, M:M Organization, 1:M Mission (composition)

**Validation Rules:** prefix must be `qst`, type must be one of defined enum, difficulty must be from defined scale

**Future Extensions:** Quest branching path visualization, completion condition and reward automation
