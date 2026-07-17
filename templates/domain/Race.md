# Race Template

**File:** `Race.template.json`

**Purpose:** Defines an ethnic or racial subgroup within a species with distinct features and homeland.

**Inheritance:** BaseEntity → Race

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseLocalization, BaseValidation, BaseAI, BaseSearch, BaseExtension

**Required Components:** identifier, metadata, audit

**Optional Components:** worldId, speciesId, type, distinguishingFeatures, abilities, homeland, population, culture, language, notableFigures

**Relationships:** 1:1 World, M:M Character

**Validation Rules:** prefix must be `rac`, speciesId must reference a valid Species entity, type must be one of defined enum

**Future Extensions:** Population distribution mapping, inter-race cultural exchange and conflict tracking
