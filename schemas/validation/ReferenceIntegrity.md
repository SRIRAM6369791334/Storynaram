# ReferenceIntegrity

**File:** `ReferenceIntegrity.schema.json`

**Purpose:** Validates that cross-entity references resolve to existing targets.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/ReferenceIntegrity.template.json`

**Required Properties:** `sourceEntity`, `targetEntity`, `referenceField`

**Key Enums:** `integrityAction` (cascade, restrict, setNull, ignore)

**Validation Scope:** cross-entity

**Cross-References:** RelationshipIntegrity, CanonIntegrity
