# Chapter Template

**File:** `Chapter.template.json`

**Purpose:** Defines a chapter within a book. Chapters compose scenes and track narrative progression.

**Inheritance:** BaseEntity → Chapter

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseVisibility, BaseAttachment, BaseValidation, BaseAI, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, entity.bookId, entity.number

**Optional Components:** entity.partId, entity.title, entity.subtitle, entity.scenes, entity.wordCount, entity.pointOfView, entity.timelineStart, entity.timelineEnd, entity.locations, entity.summary, entity.notes

**Relationships:** 1:1 Book, 1:M Scene (composition), M:M Character, M:M Timeline
