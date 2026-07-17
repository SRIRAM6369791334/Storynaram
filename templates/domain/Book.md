# Book Template | Book — Book.md

**File:** `Book.template.json`

**Purpose:** Defines any book, novel, volume, or published work within a series.

**Inheritance:** BaseEntity → Book

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseLifecycle, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseLocalization, BaseAttachment, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit

**Optional Components:** entity.series, entity.structure, entity.wordCount, entity.genre, entity.themes, entity.pointOfView, entity.setting, entity.canonStatus

**Relationships:** 1:M Chapter (composition), 1:M Scene (composition), M:M Character, M:M Timeline, 1:1 Canon

**Validation Rules:** prefix must be `book`, entity.structure.chapters and entity.character references must be resolvable

**Future Extensions:** Auto-generated outline from chapters, word count tracking, publication workflow integration
