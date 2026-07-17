# CanonIntegrity

**File:** `CanonIntegrity.schema.json`

**Purpose:** Validates that all canons referenced by entities and relationships are correctly defined and consistent.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/CanonIntegrity.template.json`

**Required Properties:** `canonId`, `entityReferences`

**Key Enums:** `integrityStatus` (consistent, inconsistent, unresolved)

**Validation Scope:** cross-entity

**Cross-References:** ReferenceIntegrity, RelationshipIntegrity
