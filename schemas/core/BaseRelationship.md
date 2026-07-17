# BaseRelationship

**File:** `BaseRelationship.schema.json`

**Purpose:** Relationship block with full cardinality and type support — defines typed connections between entities with roles, cardinality, and graph mappings.

**Referenced Template:** `templates/base/BaseRelationship.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** inside each relationship: `targetId`, `targetType`, `type`

**Key Constraints:** Relationship `type` enum: `oneToOne`, `oneToMany`, `manyToMany`, `composition`, `aggregation`, `association`, `dependency`, `inheritance`. `cardinality.min` ≥ 0, `cardinality.max` ≥ 1. `strength` range 0–1.

**Validation Notes:** Each relationship entry requires target ID, target type, and relationship type. Cardinality defaults to min=0, max=1.

**Backward Compatibility:** Adding new relationship types to the enum is non-breaking. Removing types is breaking.
