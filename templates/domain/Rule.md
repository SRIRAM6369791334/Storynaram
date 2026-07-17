# Rule Template

**File:** `Rule.template.json`

**Purpose:** Defines a law, regulation, constraint, or system rule governing the world or narrative.

**Inheritance:** BaseEntity → Rule

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseLocalization, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, type, scope

**Optional Components:** worldId, statement, rationale, exceptions, consequences, enforcement, severity, conflictingRules, relatedRules

**Relationships:** 1:1 World

**Validation Rules:** prefix must be `rul`, type and scope must be from defined enums, severity must be from absolute/suggestion scale

**Future Extensions:** Rule conflict detection and resolution prioritization, automated rule enforcement validation
