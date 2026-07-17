# Scene Template

**File:** `Scene.template.json`

**Purpose:** Defines a narrative scene — the smallest unit of storytelling with location, characters, and purpose.

**Inheritance:** BaseEntity → Scene

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseAttachment, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, entity.location, entity.timelinePosition

**Optional Components:** entity.number, entity.chapterId, entity.bookId, entity.characters, entity.pointOfView, entity.dialogue, entity.mood, entity.tone, entity.purpose, entity.conflict, entity.plotPoints, entity.wordCount, entity.content, entity.notes

**Relationships:** 1:1 Chapter, 1:1 Book, M:M Character, M:M Location, M:M Dialogue, 1:1 Timeline
