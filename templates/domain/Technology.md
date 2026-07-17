# Technology Template

**File:** `Technology.template.json`

**Purpose:** Defines any technological system, device, innovation, or scientific advancement.

**Inheritance:** BaseEntity → Technology

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit

**Optional Components:** worldId, type, era, tier, inventor, inventionDate, principles, components, applications, limitations, resourceCost, prevalence, relatedTechnologies

**Relationships:** 1:1 World, M:M Character

**Validation Rules:** prefix must be `tch`, type must be one of defined enum, tier must be >= 0 if defined

**Future Extensions:** Technology tree progression mapping, prerequisite and dependency chain validation
