# Map Template

**File:** `Map.template.json`

**Purpose:** Defines a map, chart, or spatial representation of a world, region, or location.

**Inheritance:** BaseEntity → Map

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseLocalization, BaseAttachment, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit

**Optional Components:** worldId, type, scale, projection, coordinates, markers, regions, annotations, imageUrl, grid

**Relationships:** 1:1 World (composition), M:M Location

**Validation Rules:** prefix must be `map`, type must be one of defined enum, markers must reference valid Location entities

**Future Extensions:** Interactive map rendering with pin markers, coordinate-based distance measurement
