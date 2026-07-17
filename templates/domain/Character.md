# Character Template

**File:** `Character.template.json`

**Purpose:** Defines the structure for any character entity — protagonist, antagonist, supporting, minor, or background.

**Inheritance:** BaseEntity → Character

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseLifecycle, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseLocalization, BaseAttachment, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, entity.appearance, entity.biography, entity.personality

**Optional Components:** entity.abilities, entity.inventory, entity.currentLocation, entity.books, entity.scenes, entity.timelineEvents, entity.narrativeRole

**Relationships:** M:M Book, M:M Chapter, M:M Scene, M:M Dialogue, M:M Item, M:M Organization, M:M Quest, M:M Family, M:M Ability, M:M TimelineEvent, 1:1 Location, 1:M Memory, 1:1 Canon

**Validation Rules:**
- prefix must be `char`
- `entity.narrativeRole` must be a valid enum value
- References in entity.books, entity.scenes must resolve to existing entities

**Future Extensions:** Character arcs with automated progression tracking, AI-driven personality simulation, relationship graph visualization
