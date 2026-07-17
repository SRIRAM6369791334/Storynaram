# Memory Template

**File:** `Memory.template.json`

**Purpose:** Defines a stored recollection, event memory, or knowledge fragment for characters or AI.

**Inheritance:** BaseEntity → Memory

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseLifecycle, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, type, ownerId

**Optional Components:** ownerType, memory, embedding, importance, recency, frequency, associations, emotions, source, accuracy, decay, consolidated, lastRecalled

**Relationships:** 1:M Character (composition)

**Validation Rules:** prefix must be `mem`, type must be one of defined enum (character, ai, story, system, canon), ownerId must reference a valid entity, importance must be 0–100

**Future Extensions:** Memory consolidation simulation from short-term to long-term, decay-based forgetting curves
