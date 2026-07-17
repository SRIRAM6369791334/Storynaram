# Artifact Template

**File:** `Artifact.template.json`

**Purpose:** Defines a unique, legendary, or historically significant item of great power or importance.

**Inheritance:** BaseEntity → Artifact

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, type

**Optional Components:** tier, powers, curse, requirements, attunement, originalCreator, creationDate, material, historicalSignificance, owners, currentLocation, destruction

**Relationships:** 1:1 Item, M:M Character

**Validation Rules:** prefix must be `art`, tier must be one of defined rarities (common to divine), attunement defaults to true

**Future Extensions:** Artifact lineage and owner history timeline, curse and power interaction mapping
