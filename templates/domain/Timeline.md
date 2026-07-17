# Timeline Template

**File:** `Timeline.template.json`

**Purpose:** Defines a chronological framework organizing eras, calendars, and sequences of events.

**Inheritance:** BaseEntity → Timeline

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit

**Optional Components:** worldId, type, eras, calendar, events, parallelTimelines

**Relationships:** 1:1 World (composition), 1:M TimelineEvent (composition), M:M Book, M:M Chapter, M:M Scene, 1:1 Canon

**Validation Rules:** prefix must be `tim`, calendar.epoch must be defined if calendar is present, era dates must not overlap

**Future Extensions:** Visual timeline rendering, date arithmetic and relative date calculation
