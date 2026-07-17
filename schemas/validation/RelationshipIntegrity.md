# RelationshipIntegrity

**File:** `RelationshipIntegrity.schema.json`

**Purpose:** Ensures that entity relationships adhere to defined cardinality and direction rules.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/RelationshipIntegrity.template.json`

**Required Properties:** `relationshipType`, `source`, `target`

**Key Enums:** `relationshipType` (oneToOne, oneToMany, manyToMany), `direction` (unidirectional, bidirectional)

**Validation Scope:** cross-entity

**Cross-References:** ReferenceIntegrity, CanonIntegrity
