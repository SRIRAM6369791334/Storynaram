# Dialogue Template

**File:** `Dialogue.template.json`

**Purpose:** Defines a dialogue exchange between characters. Supports monologue and internal thought.

**Inheritance:** BaseEntity → Dialogue

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, entity.speakers, entity.lines

**Optional Components:** entity.sceneId, entity.language, entity.context, entity.subtext, entity.purpose, entity.isMonologue, entity.isInternalThought

**Relationships:** 1:1 Scene, M:M Character, 1:1 Location
