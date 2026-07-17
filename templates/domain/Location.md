# Location Template

**File:** `Location.template.json`

**Purpose:** Defines a place, point of interest, or setting within a world.

**Inheritance:** BaseEntity → Location

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseLocalization, BaseAttachment, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, type

**Optional Components:** worldId, parentLocation, coordinates, climate, terrain, population, notableFeatures, controlledBy, inhabitants, landmarks, connections

**Relationships:** 1:1 World (composition), M:M Chapter, M:M Scene, 1:1 Dialogue, M:M Character, M:M TimelineEvent, M:M Item, M:M Organization, M:M Quest, 1:1 Map

**Validation Rules:** prefix must be `loc`, type must be one of defined enum, worldId must reference a valid World entity

**Future Extensions:** Coordinate-based distance calculation, nested location hierarchy traversal
