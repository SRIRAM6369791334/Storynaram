# World Template

**File:** `World.template.json`

**Purpose:** Defines the structure for a fictional universe, setting, or realm.

**Inheritance:** BaseEntity → World

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseLifecycle, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseLocalization, BaseAttachment, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit

**Optional Components:** type, cosmology, geography, history, magicSystem, technology, lawsOfPhysics, majorLocations, countries, kingdoms, cities, organizations, cultures, religions, languages

**Relationships:** 1:M Location (composition), 1:1 Timeline (composition), 1:M Organization (aggregation), 1:1 Magic (association), 1:M Map, 1:1 Canon

**Validation Rules:** prefix must be `wld`, cosmology.celestialBodies must reference valid entities, geography.continents required on creation

**Future Extensions:** Multi-world multiverse linking, automated cosmology generation from geography data
