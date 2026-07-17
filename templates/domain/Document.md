# Document Template

**File:** `Document.template.json`

**Purpose:** Defines any written work, note, record, scroll, or manuscript within the world.

**Inheritance:** BaseEntity → Document

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseLocalization, BaseAttachment, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, type

**Optional Components:** author, dateWritten, language, content, summary, format, condition, location, owner, accessibility

**Relationships:** M:M Character, M:M World, M:M Location, M:M Organization

**Validation Rules:** prefix must be `doc`, type must be one of defined enum, format must be physical/digital/magical/oral

**Future Extensions:** Full text search across documents, in-universe citation and reference linking
