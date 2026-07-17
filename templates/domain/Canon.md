# Canon Template

**File:** `Canon.template.json`

**Purpose:** Defines a canonical truth, timeline branch, or narrative authority with decisions and inconsistencies.

**Inheritance:** BaseEntity → Canon

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseLifecycle, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, type

**Optional Components:** status, authority, source, decisions, inconsistencies, resolvedInconsistencies, entities, events, relatedCanons

**Relationships:** 1:1 Book, 1:1 Character, 1:1 World, 1:1 Timeline, M:M TimelineEvent

**Validation Rules:** prefix must be `can`, type must be one of defined enum (primary, alternate, retconned, etc.), decisions must be recorded with rationale

**Future Extensions:** Cross-timeline consistency checking, retcon impact analysis on dependent entities
