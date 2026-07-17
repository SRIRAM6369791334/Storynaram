# City Template

**File:** `City.template.json`

**Purpose:** Defines a city, town, or settlement with population, governance, and infrastructure.

**Inheritance:** BaseEntity → City

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseLocalization, BaseAttachment, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, worldId

**Optional Components:** countryId, kingdomId, type, population, area, districts, notableLocations, governance, ruler, economy, defenses, demographics, founded, notableEvents

**Relationships:** 1:1 World (composition), M:M Location

**Validation Rules:** prefix must be `cit`, worldId must reference a valid World entity, type must be one of defined enum values

**Future Extensions:** District-level breakdown and sub-location hierarchy, population growth simulation
