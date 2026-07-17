# Kingdom Template

**File:** `Kingdom.template.json`

**Purpose:** Defines a monarchy, realm, or sovereign territory with royal lineage and governance.

**Inheritance:** BaseEntity → Kingdom

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseLocalization, BaseAttachment, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, worldId

**Optional Components:** countryId, capital, monarch, government, succession, royalHouse, cities, territories, population, founded, fell, motto, sigil, colors

**Relationships:** 1:1 World (composition), M:M Location

**Validation Rules:** prefix must be `kdm`, worldId must reference a valid World entity, succession must be from defined enum values

**Future Extensions:** Royal succession line visualization, territorial expansion over time mapping
