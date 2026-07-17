# Species Template

**File:** `Species.template.json`

**Purpose:** Defines a biological species or sentient race with physical traits and societal characteristics.

**Inheritance:** BaseEntity → Species

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseLocalization, BaseValidation, BaseAI, BaseSearch, BaseExtension

**Required Components:** identifier, metadata, audit

**Optional Components:** worldId, type, classification, lifespan, averageHeight, averageWeight, distinguishingFeatures, abilities, weaknesses, habitat, diet, reproduction, society, language, homeland, subspecies

**Relationships:** 1:1 World, M:M Character

**Validation Rules:** prefix must be `spc`, type must be one of defined enum, classification must be from sentient/semi-sentient/non-sentient/magical/divine

**Future Extensions:** Subspecies branching tree, evolutionary adaptation tracking across environments
