# Country Template

**File:** `Country.template.json`

**Purpose:** Defines a sovereign nation, territory, or political state within a world.

**Inheritance:** BaseEntity → Country

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseLocalization, BaseAttachment, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, worldId

**Optional Components:** capital, government, ruler, cities, regions, population, area, languages, currency, exports, imports, military, allies, enemies, history

**Relationships:** 1:1 World (composition), M:M Location

**Validation Rules:** prefix must be `cty`, worldId must reference a valid World entity, capital must reference a valid City entity

**Future Extensions:** Diplomatic relationship mapping, trade route generation between countries
