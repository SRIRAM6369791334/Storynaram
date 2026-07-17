# TimelineEvent Template

**File:** `TimelineEvent.template.json`

**Purpose:** Defines a single event anchored to a specific timeline with date, participants, and consequences.

**Inheritance:** BaseEntity → TimelineEvent

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, date, timelineId

**Optional Components:** type, participants, locations, causes, consequences, significance, relatedEvents, sources

**Relationships:** 1:1 Timeline (composition), M:M Scene, M:M Character, M:M Location, M:M Quest

**Validation Rules:** prefix must be `tev`, date.year is required, timelineId must reference a valid Timeline entity

**Future Extensions:** Auto-causality chain mapping, significance scoring based on connected entities
